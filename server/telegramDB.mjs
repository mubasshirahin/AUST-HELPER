/**
 * Telegram User Database
 * Simple JSON file-based database for storing user Chat IDs
 * 
 * Data structure:
 * {
 *   "users": [
 *     {
 *       "chatId": "123456789",
 *       "routine": { ... },
 *       "enabled": true,
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "updatedAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ]
 * }
 * 
 * The bot token is configured via environment variable TELEGRAM_BOT_TOKEN
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', '.telegram_users.json');

// Default database structure
const DEFAULT_DB = { users: [] };

/**
 * Read the database from file
 * @returns {Object} The database object
 */
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create the file with default structure
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
      return DEFAULT_DB;
    }
    
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading telegram database:', error.message);
    return { ...DEFAULT_DB };
  }
}

/**
 * Write the database to file
 * @param {Object} db - The database object to write
 */
function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing telegram database:', error.message);
    throw new Error('Failed to save user data');
  }
}

/**
 * Register a new user or update existing user
 * @param {string} chatId - Telegram Chat ID
 * @param {Object} routine - User's routine data
 * @returns {Object} The registered user object
 */
export function registerUser(chatId, routine = null) {
  const db = readDB();
  const now = new Date().toISOString();
  
  // Check if user already exists
  const existingIndex = db.users.findIndex(u => u.chatId === String(chatId));
  
  if (existingIndex !== -1) {
    // Update existing user
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      routine: routine || db.users[existingIndex].routine,
      enabled: true,
      updatedAt: now
    };
    writeDB(db);
    return db.users[existingIndex];
  }
  
  // Create new user
  const newUser = {
    chatId: String(chatId),
    routine: routine || {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    },
    enabled: true,
    createdAt: now,
    updatedAt: now
  };
  
  db.users.push(newUser);
  writeDB(db);
  
  return newUser;
}

/**
 * Unregister a user by Chat ID
 * @param {string} chatId - Telegram Chat ID
 * @returns {boolean} True if user was removed, false if not found
 */
export function unregisterUser(chatId) {
  const db = readDB();
  const initialLength = db.users.length;
  db.users = db.users.filter(u => u.chatId !== String(chatId));
  
  if (db.users.length < initialLength) {
    writeDB(db);
    return true;
  }
  
  return false;
}

/**
 * Get a user by Chat ID
 * @param {string} chatId - Telegram Chat ID
 * @returns {Object|null} The user object or null if not found
 */
export function getUser(chatId) {
  const db = readDB();
  return db.users.find(u => u.chatId === String(chatId)) || null;
}

/**
 * Get all registered users
 * @returns {Array} Array of user objects
 */
export function getAllUsers() {
  const db = readDB();
  return db.users.filter(u => u.enabled);
}

/**
 * Update user's routine
 * @param {string} chatId - Telegram Chat ID
 * @param {Object} routine - New routine data
 * @returns {Object|null} Updated user object or null if not found
 */
export function updateUserRoutine(chatId, routine) {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.chatId === String(chatId));
  
  if (userIndex === -1) {
    return null;
  }
  
  db.users[userIndex].routine = routine;
  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDB(db);
  
  return db.users[userIndex];
}

/**
 * Toggle user notification status
 * @param {string} chatId - Telegram Chat ID
 * @returns {Object|null} Updated user object or null if not found
 */
export function toggleUserStatus(chatId) {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.chatId === String(chatId));
  
  if (userIndex === -1) {
    return null;
  }
  
  db.users[userIndex].enabled = !db.users[userIndex].enabled;
  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDB(db);
  
  return db.users[userIndex];
}

/**
 * Get statistics about registered users
 * @returns {Object} Statistics object
 */
export function getStats() {
  const db = readDB();
  const totalUsers = db.users.length;
  const enabledUsers = db.users.filter(u => u.enabled).length;
  const disabledUsers = totalUsers - enabledUsers;
  
  return {
    totalUsers,
    enabledUsers,
    disabledUsers,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Check if a chat ID is already registered
 * @param {string} chatId - Telegram Chat ID
 * @returns {boolean} True if registered, false otherwise
 */
export function isRegistered(chatId) {
  const db = readDB();
  return db.users.some(u => u.chatId === String(chatId));
}

/**
 * Save attendance record for a user
 * @param {string} chatId - Telegram Chat ID
 * @param {string} courseCode - Course code
 * @param {boolean} attended - Whether the class was attended
 * @returns {Object} Updated attendance record
 */
export function saveAttendanceRecord(chatId, courseCode, attended) {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.chatId === String(chatId));
  
  if (userIndex === -1) {
    return null;
  }
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Initialize attendance array if not exists
  if (!db.users[userIndex].attendance) {
    db.users[userIndex].attendance = [];
  }
  
  // Check if record for today and this course already exists
  const existingIndex = db.users[userIndex].attendance.findIndex(
    record => record.date === today && record.course === courseCode
  );
  
  const attendanceRecord = {
    date: today,
    course: courseCode,
    attended: attended,
    timestamp: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    // Update existing record
    db.users[userIndex].attendance[existingIndex] = attendanceRecord;
  } else {
    // Add new record
    db.users[userIndex].attendance.push(attendanceRecord);
  }
  
  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDB(db);
  
  return attendanceRecord;
}

/**
 * Get today's attendance record for a user and course
 * @param {string} chatId - Telegram Chat ID
 * @param {string} courseCode - Course code
 * @returns {Object|null} Attendance record or null
 */
export function getTodayAttendanceRecord(chatId, courseCode) {
  const db = readDB();
  const user = db.users.find(u => u.chatId === String(chatId));
  
  if (!user || !user.attendance) {
    return null;
  }
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return user.attendance.find(
    record => record.date === today && record.course === courseCode
  ) || null;
}

/**
 * Get all attendance records for a user
 * @param {string} chatId - Telegram Chat ID
 * @returns {Array} Array of attendance records
 */
export function getUserAttendanceRecords(chatId) {
  const db = readDB();
  const user = db.users.find(u => u.chatId === String(chatId));
  
  if (!user || !user.attendance) {
    return [];
  }
  
  return user.attendance;
}

/**
 * Get attendance summary for a user by course
 * @param {string} chatId - Telegram Chat ID
 * @param {string} courseCode - Course code
 * @returns {Object} Attendance summary with total, attended, and percentage
 */
export function getAttendanceSummary(chatId, courseCode) {
  const records = getUserAttendanceRecords(chatId);
  
  const courseRecords = records.filter(r => r.course === courseCode);
  const attended = courseRecords.filter(r => r.attended).length;
  const total = courseRecords.length;
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
  
  return {
    course: courseCode,
    total,
    attended,
    absent: total - attended,
    percentage
  };
}
