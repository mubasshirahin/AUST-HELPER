// ═══════════════════════════════════════════════════════════════════════
// AUSTWise — Full Annotation Storage
// Supports: marker · rectangle · circle · highlight · text · freehand
// ═══════════════════════════════════════════════════════════════════════

const ANNOTATIONS_KEY = 'aust-annotations';

const pastelColors = [
  '#fde68a', // amber-200
  '#fecaca', // red-200
  '#bfdbfe', // blue-200
  '#bbf7d0', // green-200
  '#e9d5ff', // violet-200
  '#fed7aa', // orange-200
  '#a5f3fc', // cyan-200
  '#fbcfe8', // pink-200
];

function getStored() {
  try {
    const raw = localStorage.getItem(ANNOTATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function persist(data) {
  localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(data));
}

// ─── helpers ───
function nextId() {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function pickColor(existingCount) {
  return pastelColors[existingCount % pastelColors.length];
}

// ─── CRUD ───

/** Get all annotations for a file */
export function getAnnotations(fileId) {
  const store = getStored();
  return store[fileId] || [];
}

/**
 * Add an annotation.
 * `data` shape depends on type:
 *   marker:     { type:'marker', x, y }
 *   rectangle:  { type:'rect', x, y, w, h }
 *   circle:     { type:'circle', x, y, rx, ry }
 *   highlight:  { type:'highlight', x, y, w, h }
 *   text:       { type:'text', x, y, content }
 *   freehand:   { type:'freehand', points:[{x,y}] }
 * Plus optional: color, strokeWidth
 */
export function addAnnotation(fileId, data) {
  const store = getStored();
  if (!store[fileId]) store[fileId] = [];
  const count = store[fileId].length;
  const anno = {
    id: nextId(),
    ...data,
    note: data.note || '',
    color: data.color || pickColor(count),
    strokeWidth: data.strokeWidth ?? 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store[fileId].push(anno);
  persist(store);
  return anno;
}

/** Update the note text of an annotation */
export function updateAnnotation(fileId, annoId, note) {
  const store = getStored();
  const list = store[fileId];
  if (!list) return;
  const idx = list.findIndex((n) => n.id === annoId);
  if (idx === -1) return;
  list[idx].note = note;
  list[idx].updatedAt = Date.now();
  persist(store);
}

/** Update shape data (used during drawing finalise) */
export function updateAnnotationData(fileId, annoId, shapeData) {
  const store = getStored();
  const list = store[fileId];
  if (!list) return;
  const idx = list.findIndex((n) => n.id === annoId);
  if (idx === -1) return;
  Object.assign(list[idx], shapeData, { updatedAt: Date.now() });
  persist(store);
}

/** Remove an annotation */
export function removeAnnotation(fileId, annoId) {
  const store = getStored();
  const list = store[fileId];
  if (!list) return;
  store[fileId] = list.filter((n) => n.id !== annoId);
  if (store[fileId].length === 0) delete store[fileId];
  persist(store);
}

/** Get count for a file */
export function getAnnotationCount(fileId) {
  return getAnnotations(fileId).length;
}
