import { query, sql } from './db.mjs';

export async function registerUser(chatId, routine = null) {
  const r = routine ? JSON.stringify(routine) : null;
  const result = await query(`
    MERGE TelegramUsers AS target
    USING (SELECT @chatId AS ChatId) AS source
    ON target.ChatId = source.ChatId
    WHEN MATCHED THEN UPDATE SET Routine = COALESCE(@routine, target.Routine), Enabled = 1, UpdatedAt = GETDATE()
    WHEN NOT MATCHED THEN INSERT (ChatId, Routine, Enabled, CreatedAt, UpdatedAt) VALUES (@chatId, @routine, 1, GETDATE(), GETDATE())
    OUTPUT inserted.*;
  `, {
    chatId: { value: String(chatId) },
    routine: { type: sql.NVarChar(sql.MAX), value: r },
  });
  return result.recordset[0] || null;
}

export async function unregisterUser(chatId) {
  const r = await query('DELETE FROM TelegramUsers WHERE ChatId = @chatId; SELECT @@ROWCOUNT AS deleted', { chatId: { value: String(chatId) } });
  return (r.recordset[0]?.deleted || 0) > 0;
}

export async function getUser(chatId) {
  const r = await query('SELECT * FROM TelegramUsers WHERE ChatId = @chatId', { chatId: { value: String(chatId) } });
  return r.recordset[0] || null;
}

export async function getAllUsers() {
  const r = await query('SELECT * FROM TelegramUsers WHERE Enabled = 1');
  return r.recordset;
}

export async function updateUserRoutine(chatId, routine) {
  const r = await query("UPDATE TelegramUsers SET Routine = @routine, UpdatedAt = GETDATE() WHERE ChatId = @chatId; SELECT * FROM TelegramUsers WHERE ChatId = @chatId", {
    chatId: { value: String(chatId) },
    routine: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(routine) },
  });
  return r.recordset[0] || null;
}

export async function toggleUserStatus(chatId) {
  const r = await query("UPDATE TelegramUsers SET Enabled = CASE WHEN Enabled = 1 THEN 0 ELSE 1 END, UpdatedAt = GETDATE() WHERE ChatId = @chatId; SELECT * FROM TelegramUsers WHERE ChatId = @chatId", { chatId: { value: String(chatId) } });
  return r.recordset[0] || null;
}

export async function getStats() {
  const r = await query('SELECT COUNT(*) AS totalUsers, SUM(CASE WHEN Enabled = 1 THEN 1 ELSE 0 END) AS enabledUsers, SUM(CASE WHEN Enabled = 0 THEN 1 ELSE 0 END) AS disabledUsers FROM TelegramUsers');
  const row = r.recordset[0] || {};
  return { totalUsers: row.totalUsers || 0, enabledUsers: row.enabledUsers || 0, disabledUsers: row.disabledUsers || 0, lastUpdated: new Date().toISOString() };
}

export async function isRegistered(chatId) {
  const r = await query('SELECT COUNT(1) AS cnt FROM TelegramUsers WHERE ChatId = @chatId', { chatId: { value: String(chatId) } });
  return (r.recordset[0]?.cnt || 0) > 0;
}

export async function saveAttendanceRecord(chatId, courseCode, attended) {
  const r = await query(`
    MERGE AttendanceRecords AS target
    USING (SELECT @chatId AS ChatId, @course AS CourseCode, CAST(GETDATE() AS DATE) AS RecordDate) AS source
    ON target.ChatId = source.ChatId AND target.CourseCode = source.CourseCode AND target.RecordDate = source.RecordDate
    WHEN MATCHED THEN UPDATE SET Attended = @attended, Timestamp = GETDATE()
    WHEN NOT MATCHED THEN INSERT (ChatId, CourseCode, Attended, RecordDate, Timestamp) VALUES (@chatId, @course, @attended, CAST(GETDATE() AS DATE), GETDATE())
    OUTPUT inserted.*;
  `, { chatId: { value: String(chatId) }, course: { value: courseCode }, attended: { type: sql.Bit, value: attended } });
  return r.recordset[0] || null;
}

/**
 * Save an attendance record for a specific date (for Telegram sync with backdated entries).
 * Uses the provided date string (YYYY-MM-DD) instead of GETDATE().
 */
export async function saveAttendanceRecordForDate(chatId, courseCode, attended, recordDate) {
  const r = await query(`
    MERGE AttendanceRecords AS target
    USING (SELECT @chatId AS ChatId, @course AS CourseCode, @recordDate AS RecordDate) AS source
    ON target.ChatId = source.ChatId AND target.CourseCode = source.CourseCode AND target.RecordDate = source.RecordDate
    WHEN MATCHED THEN UPDATE SET Attended = @attended, Timestamp = GETDATE()
    WHEN NOT MATCHED THEN INSERT (ChatId, CourseCode, Attended, RecordDate, Timestamp) VALUES (@chatId, @course, @attended, @recordDate, GETDATE())
    OUTPUT inserted.*;
  `, { 
    chatId: { value: String(chatId) }, 
    course: { value: courseCode }, 
    attended: { type: sql.Bit, value: attended },
    recordDate: { value: recordDate }
  });
  return r.recordset[0] || null;
}

export async function getTodayAttendanceRecord(chatId, courseCode) {
  const r = await query("SELECT * FROM AttendanceRecords WHERE ChatId = @chatId AND CourseCode = @course AND RecordDate = CAST(GETDATE() AS DATE)", { chatId: { value: String(chatId) }, course: { value: courseCode } });
  return r.recordset[0] || null;
}

export async function getUserAttendanceRecords(chatId) {
  const r = await query('SELECT * FROM AttendanceRecords WHERE ChatId = @chatId ORDER BY RecordDate DESC, Timestamp DESC', { chatId: { value: String(chatId) } });
  return r.recordset;
}

export async function getAttendanceSummary(chatId, courseCode) {
  const r = await query("SELECT COUNT(1) AS total, SUM(CASE WHEN Attended = 1 THEN 1 ELSE 0 END) AS attended, SUM(CASE WHEN Attended = 0 THEN 1 ELSE 0 END) AS absent FROM AttendanceRecords WHERE ChatId = @chatId AND CourseCode = @course", { chatId: { value: String(chatId) }, course: { value: courseCode } });
  const row = r.recordset[0] || {};
  return { course: courseCode, total: row.total || 0, attended: row.attended || 0, absent: row.absent || 0, percentage: row.total > 0 ? Math.round((row.attended / row.total) * 100) : 0 };
}
