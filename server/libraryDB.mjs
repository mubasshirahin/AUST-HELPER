/**
 * Library Presence Database
 * Simple JSON file-based store for real-time library occupancy via GPS check-ins.
 *
 * How it works (no hardware sensors needed):
 *  - A user's browser sends its GPS coordinates to /api/library/checkin.
 *  - The server checks whether those coordinates fall inside the library geofence
 *    (a circle around LIBRARY_LAT/LIBRARY_LNG with radius LIBRARY_RADIUS_M).
 *  - If inside, the user's deviceId is stored as "present" with a timestamp.
 *  - The browser re-sends a check-in every ~60s (heartbeat). Any check-in that
 *    hasn't been refreshed within PRESENCE_TTL_MS is treated as gone and pruned.
 *  - Occupancy = number of active (non-stale) check-ins.
 *
 * Data structure (.library_presence.json):
 * {
 *   "checkins": [
 *     { "deviceId": "abc-123", "lat": 23.76, "lng": 90.40, "updatedAt": "..." }
 *   ]
 * }
 *
 * Geofence is configurable via environment variables:
 *   LIBRARY_LAT, LIBRARY_LNG, LIBRARY_RADIUS_M, LIBRARY_CAPACITY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', '.library_presence.json');

const DEFAULT_DB = { checkins: [] };

// A check-in older than this (no heartbeat refresh) is considered gone.
const PRESENCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Library geofence. Defaults point to AUST, Love Road, Tejgaon, Dhaka 1208
// (plus code QC74+9X8). Override LIBRARY_LAT/LIBRARY_LNG in your .env if needed.
const LIBRARY_LAT = Number(process.env.LIBRARY_LAT || 23.7634);
const LIBRARY_LNG = Number(process.env.LIBRARY_LNG || 90.4074);
const LIBRARY_RADIUS_M = Number(process.env.LIBRARY_RADIUS_M || 80);
const LIBRARY_CAPACITY = Number(process.env.LIBRARY_CAPACITY || 120);

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
      return { checkins: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    return { checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [] };
  } catch (error) {
    console.error('Error reading library database:', error.message);
    return { checkins: [] };
  }
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing library database:', error.message);
    throw new Error('Failed to save library presence data');
  }
}

/**
 * Great-circle distance between two lat/lng points, in meters.
 */
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Drop check-ins whose last heartbeat is older than the TTL. */
function pruneStale(checkins) {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  return checkins.filter((c) => {
    const t = new Date(c.updatedAt).getTime();
    return Number.isFinite(t) && t >= cutoff;
  });
}

/**
 * Record (or refresh) a check-in from a device's GPS position.
 * Returns whether the position is inside the geofence and the current occupancy.
 */
export function recordCheckIn(deviceId, lat, lng) {
  if (!deviceId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('deviceId, lat and lng are required.');
  }

  const distance = haversineMeters(LIBRARY_LAT, LIBRARY_LNG, lat, lng);
  const inside = distance <= LIBRARY_RADIUS_M;

  const db = readDB();
  let checkins = pruneStale(db.checkins);
  const now = new Date().toISOString();

  if (inside) {
    const existing = checkins.find((c) => c.deviceId === deviceId);
    if (existing) {
      existing.lat = lat;
      existing.lng = lng;
      existing.updatedAt = now;
    } else {
      checkins.push({ deviceId, lat, lng, updatedAt: now });
    }
  } else {
    // Moved outside the geofence → no longer counted.
    checkins = checkins.filter((c) => c.deviceId !== deviceId);
  }

  writeDB({ checkins });

  return {
    inside,
    distance: Math.round(distance),
    radius: LIBRARY_RADIUS_M,
    occupied: checkins.length,
    capacity: LIBRARY_CAPACITY,
  };
}

/** Explicitly remove a device (user tapped "check out" or left). */
export function recordCheckOut(deviceId) {
  const db = readDB();
  const checkins = pruneStale(db.checkins).filter((c) => c.deviceId !== deviceId);
  writeDB({ checkins });
  return { occupied: checkins.length, capacity: LIBRARY_CAPACITY };
}

/** Current live occupancy (stale check-ins pruned). */
export function getOccupancy() {
  const db = readDB();
  const active = pruneStale(db.checkins);
  if (active.length !== db.checkins.length) {
    writeDB({ checkins: active });
  }
  const occupancyPercent =
    LIBRARY_CAPACITY > 0 ? Math.round((active.length / LIBRARY_CAPACITY) * 100) : 0;
  return {
    occupied: active.length,
    capacity: LIBRARY_CAPACITY,
    occupancyPercent,
    updatedAt: new Date().toISOString(),
  };
}
