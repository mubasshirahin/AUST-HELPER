import { heatmapDepartments } from '../../utils/deptHeatmapStorage';
import { getYearSemOptions } from '../../utils/semester';

const storageKey = 'aust-vault-selection-v1';

const emptySelection = () => ({
  department: null,
  yearSem: null,
});

export function loadVaultSelection() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptySelection();

    const saved = JSON.parse(raw);
    const department = heatmapDepartments.includes(saved.department) ? saved.department : null;
    if (!department) return emptySelection();

    const yearSemOptions = getYearSemOptions(department);
    const yearSem = yearSemOptions.includes(saved.yearSem) ? saved.yearSem : null;

    return {
      department,
      yearSem,
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
