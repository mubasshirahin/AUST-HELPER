/**
 * Telegram Notification Scheduler
 * Standalone script that can be run via cron job to send daily notifications
 * 
 * Cron job setup:
 * - 8 AM Daily Notification: 0 8 * * * cd /path/to/aust-student-helper && node server/telegramScheduler.mjs
 * - 9 PM Attendance Tracking: 0 21 * * * cd /path/to/aust-student-helper && node server/telegramScheduler.mjs attendance
 * 
 * Or for development/testing, run directly:
 * node server/telegramScheduler.mjs          - Run 8 AM notification
 * node server/telegramScheduler.mjs attendance - Run 9 PM attendance notification
 */

import 'dotenv/config';
import { sendDailyNotifications, sendDailyAttendanceMessages } from './telegramNotifier.mjs';
import { getStats } from './telegramDB.mjs';

async function runScheduler(isAttendanceScheduler = false) {
  console.log('='.repeat(50));
  if (isAttendanceScheduler) {
    console.log('AUSTWise - Telegram Attendance Scheduler');
  } else {
    console.log('AUSTWise - Telegram Notification Scheduler');
  }
  console.log('='.repeat(50));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('');
  
  // Get stats before sending
  const stats = getStats();
  console.log(`Registered users: ${stats.totalUsers}`);
  console.log(`Enabled users: ${stats.enabledUsers}`);
  console.log(`Disabled users: ${stats.disabledUsers}`);
  console.log('');
  
  if (stats.enabledUsers === 0) {
    console.log('No enabled users found. Exiting.');
    console.log('='.repeat(50));
    process.exit(0);
  }
  
  // Send notifications
  if (isAttendanceScheduler) {
    console.log('Sending 9 PM attendance messages...');
  } else {
    console.log('Sending daily notifications...');
  }
  console.log('');
  
  try {
    let result;
    if (isAttendanceScheduler) {
      result = await sendDailyAttendanceMessages();
    } else {
      result = await sendDailyNotifications();
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('Scheduler completed successfully');
    console.log(`Total: ${result.totalUsers} | Sent: ${result.sent} | Failed: ${result.failed}`);
    console.log('='.repeat(50));
    
    // Exit with appropriate code
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('');
    console.error('='.repeat(50));
    console.error('Scheduler failed with error:', error.message);
    console.error('='.repeat(50));
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const isAttendanceScheduler = args.includes('attendance');

// Run the scheduler
runScheduler(isAttendanceScheduler);
