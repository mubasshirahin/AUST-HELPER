/** Semester number (1–8) → year-term label, e.g. 1 → "1.1", 2 → "1.2". */
export function formatSemesterLabel(semester) {
  const sem = Number(semester);
  if (!Number.isFinite(sem) || sem < 1) return '';
  const year = Math.ceil(sem / 2);
  const term = sem % 2 === 0 ? 2 : 1;
  return `${year}.${term}`;
}
