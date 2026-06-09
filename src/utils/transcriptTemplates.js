/**
 * Transcript Templates Storage System
 * Global templates that admin can manage and users can load
 */

const TEMPLATES_STORAGE_KEY = 'aust-transcript-templates-v1';

// Default templates for different semesters
export const defaultTemplates = [
  {
    id: 'transcript-template-1',
    name: 'CSE 1st Semester - Standard Courses',
    semester: '1-1',
    department: 'CSE',
    year: '2025',
    courses: [
      { code: 'CSE1101', name: 'Computer Fundamentals', credit: 3, grade: '-', point: null },
      { code: 'CSE1103', name: 'Programming Fundamentals Lab', credit: 1.5, grade: '-', point: null },
      { code: 'MATH1101', name: 'Calculus I', credit: 3, grade: '-', point: null },
      { code: 'ENG1101', name: 'English Language', credit: 3, grade: '-', point: null },
      { code: 'PHY1101', name: 'Physics I', credit: 3, grade: '-', point: null },
      { code: 'PHY1103', name: 'Physics Lab', credit: 1.5, grade: '-', point: null },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'transcript-template-2',
    name: 'CSE 3rd Semester - Standard Courses',
    semester: '1-2',
    department: 'CSE',
    year: '2025',
    courses: [
      { code: 'CSE2101', name: 'Data Structures', credit: 3, grade: '-', point: null },
      { code: 'CSE2103', name: 'Data Structures Lab', credit: 1.5, grade: '-', point: null },
      { code: 'CSE2105', name: 'Algorithms', credit: 3, grade: '-', point: null },
      { code: 'MATH2101', name: 'Probability & Statistics', credit: 3, grade: '-', point: null },
      { code: 'CSE2107', name: 'Database Systems', credit: 3, grade: '-', point: null },
      { code: 'CSE2109', name: 'Database Lab', credit: 1.5, grade: '-', point: null },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'transcript-template-3',
    name: 'CSE 5th Semester - Standard Courses',
    semester: '2-1',
    department: 'CSE',
    year: '2025',
    courses: [
      { code: 'CSE3101', name: 'Operating Systems', credit: 3, grade: '-', point: null },
      { code: 'CSE3103', name: 'OS Lab', credit: 1.5, grade: '-', point: null },
      { code: 'CSE3105', name: 'Computer Networks', credit: 3, grade: '-', point: null },
      { code: 'CSE3107', name: 'Software Engineering', credit: 3, grade: '-', point: null },
      { code: 'CSE3109', name: 'AI Fundamentals', credit: 3, grade: '-', point: null },
      { code: 'CSE3111', name: 'AI Lab', credit: 1.5, grade: '-', point: null },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load all templates from storage
export function loadTemplates() {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return default templates if no stored templates
    return defaultTemplates;
  } catch {
    return defaultTemplates;
  }
}

// Save all templates to storage
export function saveTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage error
  }
}

// Get a single template by ID
export function getTemplateById(templateId) {
  const templates = loadTemplates();
  return templates.find(t => t.id === templateId) || null;
}

// Add a new template
export function addTemplate(template) {
  const templates = loadTemplates();
  const newTemplate = {
    ...template,
    id: `transcript-template-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.push(newTemplate);
  saveTemplates(templates);
  return newTemplate;
}

// Update an existing template
export function updateTemplate(templateId, updates) {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTemplates(templates);
    return templates[index];
  }
  return null;
}

// Delete a template
export function deleteTemplate(templateId) {
  const templates = loadTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  if (filtered.length !== templates.length) {
    saveTemplates(filtered);
    return true;
  }
  return false;
}

// Get templates by department
export function getTemplatesByDepartment(department) {
  const templates = loadTemplates();
  return templates.filter(t => t.department === department);
}

// Get templates by semester
export function getTemplatesBySemester(semester) {
  const templates = loadTemplates();
  return templates.filter(t => t.semester === semester);
}