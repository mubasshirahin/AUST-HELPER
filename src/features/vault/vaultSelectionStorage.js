import { heatmapDepartments } from '../../utils/deptHeatmapStorage';
import { getYearSemOptions } from '../../utils/semester';
import { getCourseCategories, vaultResourceTabs } from './vaultUtils';

const storageKey = 'aust-vault-selection-v1';

const emptySelection = () => ({
  department: null,
  yearSem: null,
  course: null,
  courseName: '',
  courseType: 'Theory',
  activeTab: 'qb',
});

const validTabIds = new Set(vaultResourceTabs.map((tab) => tab.id));

function normalizeTab(tab) {
  return validTabIds.has(tab) ? tab : 'qb';
}

export function loadVaultSelection() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptySelection();

    const saved = JSON.parse(raw);
    const department = heatmapDepartments.includes(saved.department) ? saved.department : null;
    if (!department) return emptySelection();

    const yearSemOptions = getYearSemOptions(department);
    const yearSem = yearSemOptions.includes(saved.yearSem) ? saved.yearSem : null;
    if (!yearSem) {
      return {
        department,
        yearSem: null,
        course: null,
        courseName: '',
        courseType: 'Theory',
        activeTab: normalizeTab(saved.activeTab),
      };
    }

    const courseMatch = getCourseCategories(department, yearSem).find(
      (item) => item.course === saved.course,
    );
    if (!courseMatch) {
      return {
        department,
        yearSem,
        course: null,
        courseName: '',
        courseType: 'Theory',
        activeTab: normalizeTab(saved.activeTab),
      };
    }

    return {
      department,
      yearSem,
      course: courseMatch.course,
      courseName: courseMatch.name,
      courseType: courseMatch.courseType || 'Theory',
      activeTab: normalizeTab(saved.activeTab),
    };
  } catch {
    return emptySelection();
  }
}

export function saveVaultSelection(selection) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(selection));
  } catch {
    // Ignore quota errors for lightweight selection metadata.
  }
}
