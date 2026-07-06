const accentColorMap = {
  '#6391ff': '#b0975d',
  '#a78bfa': '#8f8675',
  '#34d399': '#6fa386',
  '#fb923c': '#b8875f',
  '#22d3ee': '#7c9aa3',
  '#fb7185': '#bf7a7a',
  '#4f72d4': '#7a653d',
  '#7c3aed': '#766d61',
  '#059669': '#3f7b63',
  '#ea580c': '#9a6842',
  '#0891b2': '#5d7780',
  '#e11d48': '#9a5b5f',
};

export function normalizeAccentColor(color, fallback = '#b0975d') {
  if (!color || typeof color !== 'string') return fallback;
  return accentColorMap[color.toLowerCase()] || color;
}

const tableColors = [
  '#5b8af7', '#f97316', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#eab308', '#ef4444',
  '#14b8a6', '#a855f7', '#f59e0b', '#3b82f6',
  '#84cc16', '#d946ef', '#0ea5e9', '#22c55e',
];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getCourseColor(courseCode) {
  if (!courseCode) return tableColors[0];
  const idx = hashStr(courseCode) % tableColors.length;
  return tableColors[idx];
}
