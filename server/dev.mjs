import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { extractRoutineFromImage } from './routineExtractor.mjs';
import { 
  sendDailyNotifications, 
  sendTestNotification,
  registerUserForNotifications,
  sendTestAttendanceMessage,
  handleAttendanceCallback,
  getTodayClasses,
  setTelegramWebhook,
  getWebhookInfo
} from './telegramNotifier.mjs';
import {
  registerUser,
  unregisterUser,
  getUser,
  getAllUsers,
  updateUserRoutine,
  toggleUserStatus,
  getStats,
  isRegistered,
  saveAttendanceRecord,
  getTodayAttendanceRecord,
  getUserAttendanceRecords,
  getAttendanceSummary
} from './telegramDB.mjs';
import {
  recordCheckIn,
  recordCheckOut,
  getOccupancy
} from './libraryDB.mjs';

// Helper function to answer callback query
async function answerCallbackQueryFn(botToken, callbackQueryId, text) {
  const https = await import('node:https');
  const postData = JSON.stringify({
    callback_query_id: callbackQueryId,
    text: text,
    show_alert: false
  });
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/answerCallbackQuery`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.default.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ success: result.ok });
        } catch {
          resolve({ success: false });
        }
      });
    });
    
    req.on('error', () => resolve({ success: false }));
    req.write(postData);
    req.end();
  });
}

// Helper function to update message keyboard (remove buttons)
async function updateMessageKeyboardFn(botToken, chatId, messageId, clickedCallbackData, isAttended, courseCode) {
  const https = await import('node:https');
  const postData = JSON.stringify({
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] }
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/editMessageReplyMarkup`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.default.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ success: result.ok });
        } catch {
          resolve({ success: false });
        }
      });
    });
    
    req.on('error', () => resolve({ success: false }));
    req.write(postData);
    req.end();
  });
}

const port = Number(process.env.PORT || 5174);
const maxBodyBytes = 15 * 1024 * 1024;
const useViteMiddleware = process.argv.includes('--vite');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBodyBytes) {
        reject(new Error('Image payload is too large. Please upload a smaller/compressed image.'));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON request body.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

async function sendStaticFile(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const candidatePath = path.resolve(distDir, relativePath);
  const filePath = candidatePath.startsWith(distDir) ? candidatePath : path.join(distDir, 'index.html');

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    res.end(data);
  } catch {
    try {
      const data = await readFile(path.join(distDir, 'index.html'));
      res.writeHead(200, {
        'Content-Type': contentTypes['.html'],
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    } catch {
      sendJson(res, 500, { error: 'Build output missing. Run npm run build first.' });
    }
  }
}

// CORS preflight handler
function handleCorsPreflight(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

const vite = useViteMiddleware
  ? await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
  : null;

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    handleCorsPreflight(req, res);
    return;
  }

  // Add CORS headers to all responses
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Extract routine from image
  if (req.url === '/api/extract-routine' && req.method === 'POST') {
    try {
      const { imageDataUrl } = await readJsonBody(req);
      const result = await extractRoutineFromImage(imageDataUrl);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        error: error.message || 'Routine extraction failed.',
      });
    }
    return;
  }

  // ========== Telegram API Endpoints ==========

  // Test Telegram notification
  if (req.url === '/api/telegram/test' && req.method === 'POST') {
    try {
      const { routine, chatId } = await readJsonBody(req);
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }
      
      const result = await sendTestNotification(chatId, routine);
      sendJson(res, result.success ? 200 : 500, result);
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || 'Telegram notification failed.',
      });
    }
    return;
  }

  // Register user for Telegram notifications (only Chat ID needed)
  if (req.url === '/api/telegram/register' && req.method === 'POST') {
    try {
      const { chatId, routine } = await readJsonBody(req);
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }

      // Check if already registered
      if (isRegistered(chatId)) {
        sendJson(res, 409, {
          success: false,
          error: 'This Chat ID is already registered.'
        });
        return;
      }

      // Validate credentials and register
      const result = await registerUserForNotifications(chatId, routine);
      
      if (result.success) {
        sendJson(res, 201, result);
      } else {
        sendJson(res, 400, result);
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Registration failed.',
      });
    }
    return;
  }

  // Unregister user from Telegram notifications
  if (req.url === '/api/telegram/unregister' && req.method === 'POST') {
    try {
      const { chatId } = await readJsonBody(req);
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }

      const removed = unregisterUser(chatId);
      
      if (removed) {
        sendJson(res, 200, {
          success: true,
          message: 'User unregistered successfully.'
        });
      } else {
        sendJson(res, 404, {
          success: false,
          error: 'User not found.'
        });
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Unregistration failed.',
      });
    }
    return;
  }

  // Get user registration status
  if (req.url === '/api/telegram/status' && req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const chatId = url.searchParams.get('chatId');
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }

      const registered = isRegistered(chatId);
      const user = getUser(chatId);
      
      sendJson(res, 200, {
        success: true,
        registered,
        user: user ? {
          chatId: user.chatId,
          enabled: user.enabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        } : null
      });
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get status.',
      });
    }
    return;
  }

  // Update user's routine
  if (req.url === '/api/telegram/routine' && req.method === 'PUT') {
    try {
      const { chatId, routine } = await readJsonBody(req);
      
      if (!chatId || !routine) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID and routine are required.'
        });
        return;
      }

      const user = updateUserRoutine(chatId, routine);
      
      if (user) {
        sendJson(res, 200, {
          success: true,
          user
        });
      } else {
        sendJson(res, 404, {
          success: false,
          error: 'User not found.'
        });
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to update routine.',
      });
    }
    return;
  }

  // Toggle user notification status
  if (req.url === '/api/telegram/toggle' && req.method === 'POST') {
    try {
      const { chatId } = await readJsonBody(req);
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }

      const user = toggleUserStatus(chatId);
      
      if (user) {
        sendJson(res, 200, {
          success: true,
          user
        });
      } else {
        sendJson(res, 404, {
          success: false,
          error: 'User not found.'
        });
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to toggle status.',
      });
    }
    return;
  }

  // Get all registered users (admin endpoint)
  if (req.url === '/api/telegram/users' && req.method === 'GET') {
    try {
      const users = getAllUsers();
      const stats = getStats();
      
      // Remove sensitive data from response
      const sanitizedUsers = users.map(u => ({
        chatId: u.chatId,
        enabled: u.enabled,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      
      sendJson(res, 200, {
        success: true,
        stats,
        users: sanitizedUsers
      });
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get users.',
      });
    }
    return;
  }

  // Send notifications to all users (admin endpoint - for testing)
  if (req.url === '/api/telegram/broadcast' && req.method === 'POST') {
    try {
      const result = await sendDailyNotifications();
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Broadcast failed.',
      });
    }
    return;
  }

  // Test 9 PM Attendance notification
  if (req.url === '/api/telegram/test-attendance' && req.method === 'POST') {
    try {
      const { routine, chatId } = await readJsonBody(req);
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }
      
      const result = await sendTestAttendanceMessage(chatId, routine);
      sendJson(res, result.success ? 200 : 500, result);
    } catch (error) {
      sendJson(res, 500, {
        error: error.message || 'Telegram attendance notification failed.',
      });
    }
    return;
  }

  // Handle attendance callback from Telegram bot (webhook)
  if (req.url === '/api/telegram/attendance-callback' && req.method === 'POST') {
    try {
      const { callbackQueryId, chatId, callbackData, messageId } = await readJsonBody(req);
      
      if (!callbackQueryId || !chatId || !callbackData) {
        sendJson(res, 400, {
          success: false,
          error: 'Callback query ID, Chat ID, and callback data are required.'
        });
        return;
      }
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const result = await handleAttendanceCallback(botToken, callbackQueryId, chatId, callbackData, messageId);
      sendJson(res, result.success ? 200 : 500, result);
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to handle attendance callback.',
      });
    }
    return;
  }

  // ========== Telegram Webhook Handler ==========
  // This endpoint receives updates directly from Telegram servers
  // including callback queries when users click inline buttons
  if (req.url === '/api/telegram/webhook' && req.method === 'POST') {
    try {
      const update = await readJsonBody(req);
      console.log('📩 Telegram Webhook Update:', JSON.stringify(update).substring(0, 200) + '...');
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        sendJson(res, 200, { ok: true }); // Still return ok to Telegram
        return;
      }

      // Handle callback query (inline button clicks)
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const chatId = callbackQuery.message?.chat?.id;
        const messageId = callbackQuery.message?.message_id;
        const callbackData = callbackQuery.data;
        const callbackQueryId = callbackQuery.id;

        console.log(`🔘 Callback received: ${callbackData} from chat ${chatId}`);

        if (callbackData && callbackData.startsWith('attend_')) {
          // Parse callback data: attend_yes_0_CSE101 or attend_no_0_CSE101
          const parts = callbackData.split('_');
          if (parts.length >= 4) {
            const isAttended = parts[1] === 'yes';
            const classIndex = parseInt(parts[2]);
            const courseCode = parts.slice(3).join('_');

            // Save attendance record
            const user = getUser(chatId);
            if (user) {
              saveAttendanceRecord(chatId, courseCode, isAttended);
              console.log(`✅ Attendance saved for user ${chatId}: ${courseCode} = ${isAttended ? 'Present' : 'Absent'}`);
            }

            // Answer the callback query with confirmation
            const answerText = isAttended 
              ? `✅ ${courseCode.replace(/_/g, ' ')} - Present marked!` 
              : `❌ ${courseCode.replace(/_/g, ' ')} - Absent marked!`;
            
            await answerCallbackQueryFn(botToken, callbackQueryId, answerText);

            // Update the message to remove the clicked button
            if (messageId && chatId) {
              await updateMessageKeyboardFn(botToken, chatId, messageId, callbackData, isAttended, courseCode);
            }
          }
        }
      }

      // Always return ok to Telegram
      sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      sendJson(res, 200, { ok: true }); // Still return ok to Telegram to avoid retries
    }
    return;
  }

  // Set Telegram webhook
  if (req.url === '/api/telegram/set-webhook' && req.method === 'POST') {
    try {
      const { webhookUrl } = await readJsonBody(req);
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        sendJson(res, 400, {
          success: false,
          error: 'TELEGRAM_BOT_TOKEN not configured in environment variables.'
        });
        return;
      }
      
      if (!webhookUrl) {
        // Auto-detect webhook URL from request
        const host = req.headers.host || 'localhost:5174';
        const protocol = 'https';
        const autoUrl = `${protocol}://${host}/api/telegram/webhook`;
        
        sendJson(res, 200, {
          success: true,
          message: 'Webhook URL required.',
          suggestedUrl: autoUrl,
          instructions: 'For production, set up your webhook at: https://your-domain.com/api/telegram/webhook'
        });
        return;
      }

      const result = await setTelegramWebhook(botToken, webhookUrl);
      sendJson(res, result.ok ? 200 : 500, result);
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to set webhook.',
      });
    }
    return;
  }

  // Get webhook info
  if (req.url === '/api/telegram/webhook-info' && req.method === 'GET') {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        sendJson(res, 200, {
          ok: false,
          description: 'TELEGRAM_BOT_TOKEN not configured'
        });
        return;
      }

      const result = await getWebhookInfo(botToken);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get webhook info.',
      });
    }
    return;
  }

  // Get attendance records for a user
  if (req.url.startsWith('/api/telegram/attendance') && req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const chatId = url.searchParams.get('chatId');
      const courseCode = url.searchParams.get('course');
      
      if (!chatId) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID is required.'
        });
        return;
      }
      
      if (courseCode) {
        // Get summary for specific course
        const summary = getAttendanceSummary(chatId, courseCode);
        const todayRecord = getTodayAttendanceRecord(chatId, courseCode);
        sendJson(res, 200, {
          success: true,
          summary,
          today: todayRecord
        });
      } else {
        // Get all attendance records
        const records = getUserAttendanceRecords(chatId);
        sendJson(res, 200, {
          success: true,
          records
        });
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get attendance records.',
      });
    }
    return;
  }

  // Manually record attendance (from web interface)
  if (req.url === '/api/telegram/attendance' && req.method === 'POST') {
    try {
      const { chatId, courseCode, attended } = await readJsonBody(req);
      
      if (!chatId || !courseCode) {
        sendJson(res, 400, {
          success: false,
          error: 'Chat ID and course code are required.'
        });
        return;
      }
      
      const record = saveAttendanceRecord(chatId, courseCode, attended === true);
      
      if (record) {
        sendJson(res, 200, {
          success: true,
          record
        });
      } else {
        sendJson(res, 404, {
          success: false,
          error: 'User not found.'
        });
      }
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to record attendance.',
      });
    }
    return;
  }

  // Get today's classes for a user
  if (req.url === '/api/telegram/today-classes' && req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const routine = JSON.parse(url.searchParams.get('routine') || '{}');
      
      const classes = getTodayClasses(routine);
      sendJson(res, 200, {
        success: true,
        classes
      });
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get today\'s classes.',
      });
    }
    return;
  }

  // ========== Library Occupancy Endpoints ==========

  // Check in (or heartbeat refresh) with the device's GPS position.
  // The server verifies the position is inside the library geofence.
  if (req.url === '/api/library/checkin' && req.method === 'POST') {
    try {
      const { deviceId, lat, lng } = await readJsonBody(req);
      const result = recordCheckIn(deviceId, Number(lat), Number(lng));
      sendJson(res, 200, { success: true, ...result });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.message || 'Check-in failed.',
      });
    }
    return;
  }

  // Explicit check out (user left the library or tapped "check out").
  if (req.url === '/api/library/checkout' && req.method === 'POST') {
    try {
      const { deviceId } = await readJsonBody(req);
      if (!deviceId) {
        sendJson(res, 400, { success: false, error: 'deviceId is required.' });
        return;
      }
      const result = recordCheckOut(deviceId);
      sendJson(res, 200, { success: true, ...result });
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Check-out failed.',
      });
    }
    return;
  }

  // Current live occupancy (anyone can read this).
  if (req.url === '/api/library/occupancy' && req.method === 'GET') {
    try {
      const result = getOccupancy();
      sendJson(res, 200, { success: true, ...result });
    } catch (error) {
      sendJson(res, 500, {
        success: false,
        error: error.message || 'Failed to get occupancy.',
      });
    }
    return;
  }

  if (vite) {
    vite.middlewares(req, res);
    return;
  }

  await sendStaticFile(req, res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`AUSTWise running at http://localhost:${port}`);
  console.log(`Mode: ${useViteMiddleware ? 'Vite middleware' : 'static dist (no HMR)'}`);
  console.log('');
  console.log('Telegram API Endpoints:');
  console.log('  POST /api/telegram/register           - Register user (Chat ID only)');
  console.log('  POST /api/telegram/unregister         - Unregister user');
  console.log('  GET  /api/telegram/status              - Check user registration status');
  console.log('  PUT  /api/telegram/routine             - Update user routine');
  console.log('  POST /api/telegram/toggle              - Toggle notification status');
  console.log('  GET  /api/telegram/users               - List all users (admin)');
  console.log('  POST /api/telegram/broadcast           - Send notifications to all users');
  console.log('  POST /api/telegram/test                - Send test notification (8 AM)');
  console.log('  POST /api/telegram/test-attendance     - Send test attendance message (9 PM)');
  console.log('  POST /api/telegram/attendance-callback - Handle attendance button callback');
  console.log('  POST /api/telegram/webhook             - Telegram webhook handler (for button clicks)');
  console.log('  POST /api/telegram/set-webhook         - Set Telegram webhook URL');
  console.log('  GET  /api/telegram/webhook-info        - Get webhook status');
  console.log('  GET  /api/telegram/attendance          - Get attendance records');
  console.log('  POST /api/telegram/attendance          - Record attendance manually');
  console.log('  GET  /api/telegram/today-classes       - Get today\'s classes');
  console.log('');
  console.log('Library Occupancy Endpoints:');
  console.log('  POST /api/library/checkin              - GPS check-in / heartbeat');
  console.log('  POST /api/library/checkout             - Leave the library');
  console.log('  GET  /api/library/occupancy            - Live occupancy count');
  console.log('');
  console.log('📞 Telegram Webhook Setup:');
  console.log('  To enable button clicks in Telegram, set your webhook URL using:');
  console.log('  POST /api/telegram/set-webhook with body: { "webhookUrl": "https://your-domain.com/api/telegram/webhook" }');
});
