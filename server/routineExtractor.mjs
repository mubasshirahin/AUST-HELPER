import fs from 'node:fs';
import path from 'node:path';

const allowedDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const colorByType = {
  Lab: '#34d399',
  Theory: '#6391ff',
  Other: '#a78bfa',
};

loadLocalEnv();

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function assertImageDataUrl(imageDataUrl) {
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    const error = new Error('No image was provided.');
    error.statusCode = 400;
    throw error;
  }

  if (!imageDataUrl.startsWith('data:image/')) {
    const error = new Error('Please upload a valid image file.');
    error.statusCode = 400;
    throw error;
  }
}

function normalizeTimeValue(value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/[–—]/g, '-').replace(/\s+/g, ' ');
  const match = cleaned.match(/(\d{1,2}:\d{2}\s*(?:am|pm)?)\s*-\s*(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
  if (!match) return null;
  return `${match[1].trim()} - ${match[2].trim()}`;
}

function normalizeDay(day) {
  if (!day || typeof day !== 'string') return null;
  const lower = day.trim().toLowerCase();
  return allowedDays.find((item) => item.toLowerCase().startsWith(lower.slice(0, 3))) || null;
}

function buildRoutine(extracted) {
  const issues = [];
  const routine = {};
  const seenDays = new Set();

  for (const item of extracted.classes || []) {
    const day = normalizeDay(item.day);
    const time = normalizeTimeValue(item.time);

    if (!day) {
      issues.push(`Skipped "${item.course || 'unknown course'}" because the day was unreadable.`);
      continue;
    }
    if (!time) {
      issues.push(`Skipped "${item.course || 'unknown course'}" on ${day} because the time was unreadable.`);
      continue;
    }

    seenDays.add(day);
    routine[day] ||= [];
    routine[day].push({
      id: Date.now() + routine[day].length + Object.keys(routine).length * 100,
      course: String(item.course || 'Unknown').trim(),
      name: String(item.name || item.course || 'Class').trim(),
      type: item.type === 'Lab' ? 'Lab' : 'Theory',
      time,
      room: String(item.room || 'TBA').trim(),
      teacher: String(item.teacher || 'TBA').trim(),
      color: item.color || colorByType[item.type] || colorByType.Other,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
    });

    if (item.confidence !== undefined && item.confidence < 0.75) {
      issues.push(`Low confidence: ${item.course || 'unknown course'} on ${day} at ${time}. Please review.`);
    }
  }

  for (const day of Object.keys(routine)) {
    routine[day].sort((a, b) => a.time.localeCompare(b.time));
  }

  const weekDays = allowedDays.filter((day) => seenDays.has(day));
  return {
    routine,
    weekDays,
    issues: [...issues, ...(extracted.issues || [])],
    sourceQuality: extracted.sourceQuality || 'unknown',
    summary: extracted.summary || '',
  };
}

function extractOutputText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;

  const chunks = [];
  for (const output of responseJson.output || []) {
    for (const content of output.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
      if (content.type === 'text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

export async function extractRoutineFromImage(imageDataUrl) {
  assertImageDataUrl(imageDataUrl);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is missing. Add it to .env, then restart the dev server.');
    error.statusCode = 400;
    throw error;
  }

  const model = process.env.OPENAI_ROUTINE_MODEL || 'gpt-4.1';
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      sourceQuality: { type: 'string', enum: ['clear', 'usable', 'poor', 'unknown'] },
      summary: { type: 'string' },
      issues: { type: 'array', items: { type: 'string' } },
      classes: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            day: { type: 'string' },
            course: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['Theory', 'Lab'] },
            time: { type: 'string' },
            room: { type: 'string' },
            teacher: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['day', 'course', 'name', 'type', 'time', 'room', 'teacher', 'confidence'],
        },
      },
    },
    required: ['sourceQuality', 'summary', 'issues', 'classes'],
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Extract an AUST class routine from this image with maximum care.',
                'Return only classes that are visible in the image. Do not invent missing days, rooms, teachers, or courses.',
                'If a field is unreadable, use TBA and add an issue. Use day names in English.',
                'Normalize times as "HH:MM - HH:MM" exactly as printed or clearly implied. Preserve section/lab group text in the course name when visible.',
                'Set confidence below 0.75 for any class whose row/column alignment or text is uncertain.',
              ].join('\n'),
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'aust_routine_extraction',
          schema,
          strict: true,
        },
      },
    }),
  });

  const responseJson = await response.json();
  if (!response.ok) {
    const message = responseJson.error?.message || 'OpenAI routine extraction failed.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const text = extractOutputText(responseJson);
  if (!text) {
    throw new Error('The AI response did not include extractable routine data.');
  }

  const extracted = JSON.parse(text);
  return buildRoutine(extracted);
}
