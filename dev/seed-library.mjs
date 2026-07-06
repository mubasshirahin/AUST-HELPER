/**
 * Seed dummy library check-ins so the occupancy shows ~30-40 people.
 *
 * Usage (from project root):
 *   node dev/seed-library.mjs         # random 30-40 people
 *   node dev/seed-library.mjs 25      # exactly 25 people
 *
 * Writes directly to .library_presence.json with fresh timestamps.
 * NOTE: check-ins expire 10 minutes after their timestamp, so run this
 * shortly before a demo. Run again to refresh.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '.library_presence.json');

// Library center (AUST, Love Road — plus code QC74+9X8). Keep in sync with
// libraryDB.mjs / your .env LIBRARY_LAT / LIBRARY_LNG.
const LIBRARY_LAT = Number(process.env.LIBRARY_LAT || 23.7634);
const LIBRARY_LNG = Number(process.env.LIBRARY_LNG || 90.4074);

// How many people to seed.
const arg = Number(process.argv[2]);
const count = Number.isFinite(arg) && arg > 0 ? arg : 30 + Math.floor(Math.random() * 11); // 30-40

// ~0.0004 deg ≈ 45m of jitter, so everyone lands inside the 80m geofence.
const jitter = () => (Math.random() - 0.5) * 0.0008;

const now = new Date().toISOString();
const checkins = Array.from({ length: count }, (_, i) => ({
  deviceId: `seed-${i}-${Math.random().toString(16).slice(2, 8)}`,
  lat: +(LIBRARY_LAT + jitter()).toFixed(6),
  lng: +(LIBRARY_LNG + jitter()).toFixed(6),
  updatedAt: now,
}));

fs.writeFileSync(DB_PATH, JSON.stringify({ checkins }, null, 2));
console.log(`✅ Seeded ${count} check-ins into ${path.basename(DB_PATH)}`);
console.log(`   Occupancy will read ~${count} people until they expire (10 min).`);
