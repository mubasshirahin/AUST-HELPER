const http = require('http');
const net = require('net');
const crypto = require('crypto');

const target = process.argv[2] || 'http://localhost:5174/';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

function frame(payload) {
  const data = Buffer.from(payload);
  const mask = crypto.randomBytes(4);
  const header = [];
  header.push(0x81);
  if (data.length < 126) {
    header.push(0x80 | data.length);
  } else {
    header.push(0x80 | 126, data.length >> 8, data.length & 255);
  }
  const out = Buffer.concat([Buffer.from(header), mask, data]);
  for (let i = 0; i < data.length; i += 1) {
    out[header.length + 4 + i] = data[i] ^ mask[i % 4];
  }
  return out;
}

function parseFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const b2 = buffer[offset + 1];
    let len = b2 & 0x7f;
    let header = 2;
    if (len === 126) {
      if (offset + 4 > buffer.length) break;
      len = buffer.readUInt16BE(offset + 2);
      header = 4;
    } else if (len === 127) {
      break;
    }
    const masked = Boolean(b2 & 0x80);
    const maskLen = masked ? 4 : 0;
    if (offset + header + maskLen + len > buffer.length) break;
    const start = offset + header + maskLen;
    const payload = Buffer.from(buffer.slice(start, start + len));
    if (masked) {
      const mask = buffer.slice(offset + header, offset + header + 4);
      for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
    }
    messages.push(payload.toString('utf8'));
    offset += header + maskLen + len;
  }
  return { messages, rest: buffer.slice(offset) };
}

async function main() {
  const pages = await getJson('http://localhost:9223/json');
  const page = pages.find((entry) => entry.url.startsWith(target)) || pages[0];
  const ws = new URL(page.webSocketDebuggerUrl);
  const key = crypto.randomBytes(16).toString('base64');
  const socket = net.createConnection(Number(ws.port), ws.hostname);

  await new Promise((resolve) => socket.once('connect', resolve));
  socket.write(
    `GET ${ws.pathname}${ws.search} HTTP/1.1\r\n` +
      `Host: ${ws.host}\r\n` +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Key: ${key}\r\n` +
      'Sec-WebSocket-Version: 13\r\n\r\n'
  );

  await new Promise((resolve) => {
    let handshake = '';
    socket.on('data', function onData(chunk) {
      handshake += chunk.toString('binary');
      if (handshake.includes('\r\n\r\n')) {
        socket.off('data', onData);
        resolve();
      }
    });
  });

  const expression = `(() => {
    const nodes = [...document.querySelectorAll('body *')];
    const overflowing = nodes
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className && String(el.className).slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
      .slice(0, 20);
    return {
      innerWidth: window.innerWidth,
      media768: window.matchMedia('(max-width: 768px)').matches,
      media1200: window.matchMedia('(max-width: 1200px)').matches,
      bodyScrollWidth: document.body.scrollWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      dashboardGrid: getComputedStyle(document.querySelector('.dashboard-grid') || document.body).gridTemplateColumns,
      widths: ['.app-layout', '.main-content', '.page-wrapper', '.dashboard-page', '.dashboard-grid', '.dashboard-main-col', '.routine-card'].map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { selector, left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), cssWidth: getComputedStyle(el).width };
      }),
      topbarRight: (() => {
        const el = document.querySelector('.topbar-right');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { left: Math.round(rect.left), right: Math.round(rect.right), display: getComputedStyle(el).display };
      })(),
      overflowing
    };
  })()`;

  const request = {
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression, returnByValue: true },
  };

  socket.write(frame(JSON.stringify(request)));

  let pending = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    const parsed = parseFrames(pending);
    pending = parsed.rest;
    for (const message of parsed.messages) {
      const json = JSON.parse(message);
      if (json.id === 1) {
        console.log(JSON.stringify(json.result.result.value, null, 2));
        socket.end();
      }
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
