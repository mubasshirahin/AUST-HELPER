/**
 * Routine Templates Storage System
 * Global templates that admin can manage and users can load
 */

const TEMPLATES_STORAGE_KEY = 'aust-routine-templates-v1';

// Default templates for different semesters
export const defaultTemplates = [
  {
    id: 'template-1',
    name: 'CSE 1st Semester - Spring 2025',
    semester: '1-1',
    department: 'CSE',
    year: '2025',
    routine: {
      Sunday: [
        { id: 1, course: 'CSE1101', name: 'Computer Fundamentals', time: '08:00 - 08:50', room: 'Room 301', teacher: 'Dr. Smith', color: '#b0975d', type: 'Theory' },
        { id: 2, course: 'CSE1103', name: 'Programming Fundamentals Lab', time: '09:40 - 11:20', room: 'Lab 201', teacher: 'Mr. Johnson', color: '#7c9aa3', type: 'Lab' },
      ],
      Monday: [
        { id: 3, course: 'MATH1101', name: 'Calculus I', time: '08:00 - 08:50', room: 'Room 302', teacher: 'Dr. Ahmed', color: '#8f8675', type: 'Theory' },
        { id: 4, course: 'ENG1101', name: 'English Language', time: '10:30 - 11:20', room: 'Room 205', teacher: 'Ms. Karim', color: '#6fa386', type: 'Theory' },
      ],
      Tuesday: [
        { id: 5, course: 'CSE1105', name: 'Digital Logic Design', time: '08:00 - 08:50', room: 'Room 301', teacher: 'Dr. Rahman', color: '#b0975d', type: 'Theory' },
        { id: 6, course: 'PHY1101', name: 'Physics I', time: '10:30 - 11:20', room: 'Room 401', teacher: 'Dr. Hasan', color: '#c9a66b', type: 'Theory' },
      ],
      Wednesday: [
        { id: 7, course: 'CSE1101', name: 'Computer Fundamentals', time: '09:40 - 10:30', room: 'Room 301', teacher: 'Dr. Smith', color: '#b0975d', type: 'Theory' },
        { id: 8, course: 'MATH1103', name: 'Linear Algebra', time: '11:20 - 12:10', room: 'Room 302', teacher: 'Dr. Ahmed', color: '#8f8675', type: 'Theory' },
      ],
      Thursday: [
        { id: 9, course: 'CSE1103', name: 'Programming Fundamentals Lab', time: '08:00 - 09:40', room: 'Lab 201', teacher: 'Mr. Johnson', color: '#7c9aa3', type: 'Lab' },
        { id: 10, course: 'ENG1103', name: 'Technical Writing', time: '10:30 - 11:20', room: 'Room 205', teacher: 'Ms. Karim', color: '#6fa386', type: 'Theory' },
      ],
    },
    weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'CSE 3rd Semester - Spring 2025',
    semester: '1-2',
    department: 'CSE',
    year: '2025',
    routine: {
      Sunday: [
        { id: 1, course: 'CSE2101', name: 'Data Structures', time: '08:00 - 08:50', room: 'Room 401', teacher: 'Dr. Karim', color: '#b0975d', type: 'Theory' },
        { id: 2, course: 'CSE2103', name: 'Data Structures Lab', time: '09:40 - 11:20', room: 'Lab 301', teacher: 'Mr. Rahim', color: '#7c9aa3', type: 'Lab' },
      ],
      Monday: [
        { id: 3, course: 'CSE2105', name: 'Algorithms', time: '08:00 - 08:50', room: 'Room 401', teacher: 'Dr. Salam', color: '#8f8675', type: 'Theory' },
        { id: 4, course: 'MATH2101', name: 'Probability & Statistics', time: '10:30 - 11:20', room: 'Room 302', teacher: 'Dr. Ahmed', color: '#c9a66b', type: 'Theory' },
      ],
      Tuesday: [
        { id: 5, course: 'CSE2107', name: 'Database Systems', time: '08:00 - 08:50', room: 'Room 401', teacher: 'Dr. Nasrin', color: '#b0975d', type: 'Theory' },
        { id: 6, course: 'CSE2109', name: 'Database Lab', time: '10:30 - 12:10', room: 'Lab 301', teacher: 'Mr. Rahim', color: '#7c9aa3', type: 'Lab' },
      ],
      Wednesday: [
        { id: 7, course: 'CSE2101', name: 'Data Structures', time: '09:40 - 10:30', room: 'Room 401', teacher: 'Dr. Karim', color: '#b0975d', type: 'Theory' },
        { id: 8, course: 'HUM2101', name: 'Business Communication', time: '11:20 - 12:10', room: 'Room 205', teacher: 'Ms. Fatema', color: '#6fa386', type: 'Theory' },
      ],
      Thursday: [
        { id: 9, course: 'CSE2105', name: 'Algorithms', time: '08:00 - 08:50', room: 'Room 401', teacher: 'Dr. Salam', color: '#8f8675', type: 'Theory' },
        { id: 10, course: 'CSE2107', name: 'Database Systems', time: '09:40 - 10:30', room: 'Room 401', teacher: 'Dr. Nasrin', color: '#b0975d', type: 'Theory' },
      ],
    },
    weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-3',
    name: 'CSE 5th Semester - Spring 2025',
    semester: '2-1',
    department: 'CSE',
    year: '2025',
    routine: {
      Sunday: [
        { id: 1, course: 'CSE3101', name: 'Operating Systems', time: '08:00 - 08:50', room: 'Room 501', teacher: 'Dr. Islam', color: '#b0975d', type: 'Theory' },
        { id: 2, course: 'CSE3103', name: 'OS Lab', time: '09:40 - 11:20', room: 'Lab 401', teacher: 'Mr. Kamal', color: '#7c9aa3', type: 'Lab' },
      ],
      Monday: [
        { id: 3, course: 'CSE3105', name: 'Computer Networks', time: '08:00 - 08:50', room: 'Room 501', teacher: 'Dr. Hassan', color: '#8f8675', type: 'Theory' },
        { id: 4, course: 'CSE3107', name: 'Software Engineering', time: '10:30 - 11:20', room: 'Room 501', teacher: 'Dr. Mahmud', color: '#c9a66b', type: 'Theory' },
      ],
      Tuesday: [
        { id: 5, course: 'CSE3109', name: 'AI Fundamentals', time: '08:00 - 08:50', room: 'Room 501', teacher: 'Dr. Rashid', color: '#b0975d', type: 'Theory' },
        { id: 6, course: 'CSE3111', name: 'AI Lab', time: '10:30 - 12:10', room: 'Lab 401', teacher: 'Mr. Kamal', color: '#7c9aa3', type: 'Lab' },
      ],
      Wednesday: [
        { id: 7, course: 'CSE3101', name: 'Operating Systems', time: '09:40 - 10:30', room: 'Room 501', teacher: 'Dr. Islam', color: '#b0975d', type: 'Theory' },
        { id: 8, course: 'CSE3105', name: 'Computer Networks', time: '11:20 - 12:10', room: 'Room 501', teacher: 'Dr. Hassan', color: '#8f8675', type: 'Theory' },
      ],
      Thursday: [
        { id: 9, course: 'CSE3107', name: 'Software Engineering', time: '08:00 - 08:50', room: 'Room 501', teacher: 'Dr. Mahmud', color: '#c9a66b', type: 'Theory' },
        { id: 10, course: 'CSE3109', name: 'AI Fundamentals', time: '09:40 - 10:30', room: 'Room 501', teacher: 'Dr. Rashid', color: '#b0975d', type: 'Theory' },
      ],
    },
    weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
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
    id: `template-${Date.now()}`,
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