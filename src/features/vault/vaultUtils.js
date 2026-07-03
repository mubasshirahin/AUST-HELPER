import { getAllQuestionBankItems } from '../../utils/questionBankStorage';
import { heatmapDepartments } from '../../utils/deptHeatmapStorage';
import { getYearSemOptions } from '../../utils/semester';

export { heatmapDepartments, getYearSemOptions };

export const departmentLabels = {
  CSE: 'Computer Science & Engineering',
  EEE: 'Electrical & Electronic Engineering',
  CE: 'Civil Engineering',
  ME: 'Mechanical Engineering',
  IPE: 'Industrial & Production Engineering',
  TE: 'Textile Engineering',
  ARCH: 'Architecture',
  BBA: 'Business Administration',
};

export const vaultResourceTabs = [
  { id: 'qb', label: 'Question Bank' },
  { id: 'heatmap', label: 'Topic Analysis' },
  { id: 'materials', label: 'Lecture Notes' },
  { id: 'playlists', label: 'YouTube Playlists' },
  { id: 'roadmap', label: 'Career Roadmaps' },
  { id: 'cheatsheets', label: 'Cheatsheets' },
];

export function getDepartmentPaperCount(department) {
  return getAllQuestionBankItems().filter((item) => item.department === department).length;
}

export function getSemesterPaperCount(department, yearSem) {
  return getAllQuestionBankItems().filter(
    (item) => item.department === department && item.yearSem === yearSem,
  ).length;
}

export function getCourseCategories(department, yearSem) {
  const items = getAllQuestionBankItems().filter(
    (item) => item.department === department && item.yearSem === yearSem,
  );
  const map = new Map();

  items.forEach((item) => {
    if (!map.has(item.course)) {
      map.set(item.course, {
        course: item.course,
        name: item.name,
        paperCount: 0,
      });
    }
    map.get(item.course).paperCount += 1;
  });

  return Array.from(map.values()).sort((a, b) => a.course.localeCompare(b.course));
}

/** Fall '25 → Spring '25 → Fall '24 → … → Spring '20 */
export function getQuestionBankTerms() {
  const terms = [];
  for (let shortYear = 25; shortYear >= 20; shortYear -= 1) {
    terms.push({
      season: 'Fall',
      year: 2000 + shortYear,
      label: `Fall ${shortYear}`,
      key: `Fall-${2000 + shortYear}`,
    });
    terms.push({
      season: 'Spring',
      year: 2000 + shortYear,
      label: `Spring ${shortYear}`,
      key: `Spring-${2000 + shortYear}`,
    });
  }
  return terms;
}

export function getDefaultQuestionBankTermKey() {
  return getQuestionBankTerms()[0]?.key || 'Fall-2025';
}
