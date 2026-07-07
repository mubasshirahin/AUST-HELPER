/**
 * Password strength as an AUST grading scale — because a boring
 * red/green "Weak/Strong" bar is beneath us.
 *
 *   F  → Too short
 *   D  → Barely passing
 *   C  → Add a number
 *   B  → Getting there
 *   A  → Strong
 *   A+ → Unbreakable!
 *
 * Returns { score (0..5), grade, label, tone, pct } where `pct` (0..100)
 * drives the meter bar and `tone` maps to an accent colour var.
 */
const GRADES = [
  { grade: 'F', label: 'F — Too short', tone: 'rose', pct: 12 },
  { grade: 'D', label: 'D — Barely passing', tone: 'orange', pct: 30 },
  { grade: 'C', label: 'C — Add a number', tone: 'amber', pct: 48 },
  { grade: 'B', label: 'B — Getting there', tone: 'cyan', pct: 68 },
  { grade: 'A', label: 'A — Strong', tone: 'emerald', pct: 86 },
  { grade: 'A+', label: 'A+ — Unbreakable!', tone: 'emerald', pct: 100 },
];

export function getPasswordGrade(password = '') {
  const pw = password || '';
  if (!pw) {
    return { score: -1, grade: '', label: '', tone: 'muted', pct: 0, strength: 0 };
  }

  // Hard fail: anything under 6 chars is an F regardless of variety.
  if (pw.length < 6) {
    return { ...GRADES[0], score: 0, strength: 0.12 };
  }

  let points = 0;
  if (pw.length >= 8) points += 1;
  if (pw.length >= 12) points += 1;
  if (/[0-9]/.test(pw)) points += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) points += 1;
  if (/[^A-Za-z0-9]/.test(pw)) points += 1;

  // points 0..5 → grade index 1..5 (D..A+); a 6+ char pw is at least a D.
  const idx = Math.min(GRADES.length - 1, Math.max(1, points));
  const info = GRADES[idx];
  return { ...info, score: idx, strength: info.pct / 100 };
}
