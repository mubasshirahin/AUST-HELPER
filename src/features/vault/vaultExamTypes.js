export const THEORY_EXAM_TYPES = ['Mid', 'Final', 'Quiz'];

export const LAB_EXAM_TYPES = [
  'Online',
  'Assignment',
  'Offline',
  'Lab Mid',
  'Lab Final',
  'Project',
  'Design',
];

export const ALL_EXAM_TYPES = [...THEORY_EXAM_TYPES, ...LAB_EXAM_TYPES];

/** Even last digit → Lab, odd last digit → Theory (e.g. CSE3102 = Lab, CSE3101 = Theory). */
export function inferCourseTypeFromCode(courseCode) {
  const digits = String(courseCode || '').replace(/\D/g, '');
  if (!digits) return 'Theory';
  const lastDigit = Number(digits.at(-1));
  return Number.isFinite(lastDigit) && lastDigit % 2 === 0 ? 'Lab' : 'Theory';
}

export function getExamTypesForCourseType(courseType) {
  return courseType === 'Lab' ? LAB_EXAM_TYPES : THEORY_EXAM_TYPES;
}

export function getQuestionBankSubtitle(courseType) {
  return courseType === 'Lab'
    ? 'Online, Assignments, Projects & Lab Assessments'
    : 'Midterms, Finals, Quizzes & Solutions';
}

export function getPaperTypeHeading(type) {
  if (THEORY_EXAM_TYPES.includes(type)) {
    return `${type} Term Exam Paper`;
  }
  return `${type} Paper`;
}

export function getPaperNo(item) {
  const value = item?.paperNo ?? item?.questions;
  const no = Number(value);
  return Number.isFinite(no) && no >= 1 ? Math.round(no) : null;
}

export function formatPaperLabel(type, paperNo) {
  const no = Number(paperNo);
  if (!type) return 'Paper';
  if (!Number.isFinite(no) || no < 1) return type;
  return `${type} ${no}`;
}
