/**
 * SQL Server Database Connection Module
 * Auto-creates database + tables on first run — no manual SSMS needed.
 *
 * .env config:
 *   DB_SERVER=localhost\SQLEXPRESS
 *   DB_DATABASE=AUSTWise
 *   DB_USER=sa
 *   DB_PASSWORD=your_password
 *   DB_PORT=1433
 *   DB_ENCRYPT=false
 */

import sql from 'mssql';

const useTrusted = process.env.DB_TRUSTED === 'true';

const config = {
  server:   process.env.DB_SERVER   || 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'AUSTWise',
  port:     Number(process.env.DB_PORT || 1433),
  options: {
    encrypt:                 process.env.DB_ENCRYPT === 'true',
    trustServerCertificate:  true,
    connectTimeout:          10000,
    requestTimeout:          15000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

if (useTrusted) {
  config.authentication = {
    type: 'ntlm',
    options: {
      userName: '',
      password: '',
      domain: '',
    },
  };
} else {
  config.user     = process.env.DB_USER     || 'sa';
  config.password = process.env.DB_PASSWORD || '';
}

let pool = null;

export async function getPool() {
  if (pool && pool.connected) return pool;
  pool = await sql.connect(config);
  return pool;
}

export async function query(queryStr, params) {
  const p = await getPool();
  const request = p.request();
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      request.input(key, val.type || sql.NVarChar, val.value);
    }
  }
  return request.query(queryStr);
}

/**
 * Initialize database — creates DB + tables if they don't exist.
 * Call once at server startup.
 */
export async function initializeDatabase() {
  // Step 1: Connect to master to create the database if needed
  const masterPool = await sql.connect({
    ...config,
    database: 'master',
  });

  const dbName = config.database;

  // Create database if not exists
  await masterPool.request().query(`
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${dbName}')
    BEGIN
      CREATE DATABASE [${dbName}];
    END
  `);
  await masterPool.close();

  // Step 2: Connect to our database and create tables
  const p = await getPool();

  // Create TelegramUsers table
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TelegramUsers]') AND type in (N'U'))
    BEGIN
      CREATE TABLE TelegramUsers (
        ChatId      NVARCHAR(50)    NOT NULL PRIMARY KEY,
        Routine     NVARCHAR(MAX)   NULL,
        Enabled     BIT             NOT NULL DEFAULT 1,
        CreatedAt   DATETIME2       NOT NULL DEFAULT GETDATE(),
        UpdatedAt   DATETIME2       NOT NULL DEFAULT GETDATE()
      );
    END
  `);

  // Create AttendanceRecords table
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AttendanceRecords]') AND type in (N'U'))
    BEGIN
      CREATE TABLE AttendanceRecords (
        Id          INT             IDENTITY(1,1) PRIMARY KEY,
        ChatId      NVARCHAR(50)    NOT NULL,
        CourseCode  NVARCHAR(50)    NOT NULL,
        Attended    BIT             NOT NULL,
        RecordDate  DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        Timestamp   DATETIME2       NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Attendance_TelegramUsers
            FOREIGN KEY (ChatId) REFERENCES TelegramUsers(ChatId)
            ON DELETE CASCADE,
        CONSTRAINT UQ_Attendance_Daily
            UNIQUE (ChatId, CourseCode, RecordDate)
      );

      CREATE NONCLUSTERED INDEX IX_Attendance_ChatId
        ON AttendanceRecords (ChatId)
        INCLUDE (CourseCode, Attended, RecordDate);
    END
  `);

  // Create LibraryPresence table
  await p.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LibraryPresence]') AND type in (N'U'))
    BEGIN
      CREATE TABLE LibraryPresence (
        DeviceId    NVARCHAR(100)   NOT NULL PRIMARY KEY,
        Lat         FLOAT           NOT NULL,
        Lng         FLOAT           NOT NULL,
        UpdatedAt   DATETIME2       NOT NULL DEFAULT GETDATE()
      );
    END
  `);

  console.log('✅ Database tables ready (auto-created if missing)');
  return true;
}

/**
 * Test connection and return boolean.
 */
export async function testConnection() {
  try {
    const result = await query('SELECT @@VERSION AS version');
    console.log('✅ SQL Server:', result.recordset[0].version?.substring(0, 50) + '...');
    return true;
  } catch (err) {
    console.error('❌ SQL Server connection failed:', err.message);
    return false;
  }
}

/**
 * Truncate all application data tables (dangerous — wipes all data).
 */
export async function resetDatabase() {
  const p = await getPool();
  await p.request().query('DELETE FROM AttendanceRecords;');
  await p.request().query('DELETE FROM TelegramUsers;');
  await p.request().query('DELETE FROM LibraryPresence;');
  return true;
}

export { sql };
