// ─── Cheatsheet storage (admin-added sheets + per-user favorites) ───
import { cheatsheets as seedCheatsheets } from '../data/mockData';

const SHEETS_KEY = 'aust-cheatsheets-v1';
const FAVS_KEY_PREFIX = 'aust-cheatsheet-favs-';

// ── Cheatsheets ──
export function getCheatsheets() {
  try {
    const raw = localStorage.getItem(SHEETS_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    return [...seedCheatsheets, ...(Array.isArray(stored) ? stored : [])];
  } catch {
    return [...seedCheatsheets];
  }
}

function saveStoredSheets(items) {
  localStorage.setItem(SHEETS_KEY, JSON.stringify(items));
}

function loadStoredSheets() {
  try {
    const raw = localStorage.getItem(SHEETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addCheatsheet({ title, category, course, formulas, contributorId }) {
  const sheet = {
    id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || '').trim(),
    category: String(category || '').trim() || 'General',
    course: String(course || '').trim().toUpperCase(),
    formulas: (formulas || []).map((f) => String(f).trim()).filter(Boolean),
    contributorId: contributorId || null,
    createdAt: new Date().toISOString(),
  };
  const stored = loadStoredSheets();
  stored.push(sheet);
  saveStoredSheets(stored);
  return sheet;
}

export function deleteCheatsheet(id) {
  saveStoredSheets(loadStoredSheets().filter((s) => s.id !== id));
}

// ── Favorites (per user) ──
function favsKey(userId) {
  return `${FAVS_KEY_PREFIX}${userId || 'guest'}`;
}

export function getFavoriteIds(userId) {
  try {
    const raw = localStorage.getItem(favsKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function toggleFavorite(userId, sheetId) {
  const favs = getFavoriteIds(userId);
  if (favs.has(sheetId)) favs.delete(sheetId);
  else favs.add(sheetId);
  localStorage.setItem(favsKey(userId), JSON.stringify([...favs]));
  return favs;
}
