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
