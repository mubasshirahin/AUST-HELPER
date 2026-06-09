/**
 * Auto Color Palette for Course Scheduling
 * Provides a smart color system based on course type and department
 * 
 * Color Scheme:
 * - CSE Department Courses: Blue shades
 * - Non-Department Courses (HUM, MATH, PHY, CHEM, EEE, ME, IPE): Orange/Amber shades
 * - Labs: Darker shade of the base color
 * - Theory: Lighter shade of the base color
 */

// Department prefixes for CSE courses
const CSE_DEPT_PREFIXES = ['CSE'];

// Non-CSE department prefixes
const NON_CSE_DEPT_PREFIXES = ['HUM', 'MATH', 'PHY', 'CHEM', 'EEE', 'ME', 'IPE'];

/**
 * Color definitions for different categories
 * Format: [Theory color, Lab color]
 */
const DEPARTMENT_COLORS = {
  cse: {
    theory: '#3498db',   // Sky Blue - for CSE theory courses
    lab: '#2980b9',      // Deep Blue - for CSE lab courses
  },
  nonCse: {
    theory: '#e67e22',   // Warm Orange - for non-CSE theory courses
    lab: '#d35400',      // Dark Orange - for non-CSE lab courses
  },
};

/**
 * Determine if a course is a CSE department course
 * @param {string} courseCode - Course code (e.g., "CSE1101", "MATH1115")
 * @returns {boolean} - True if it's a CSE department course
 */
export function isCseDepartmentCourse(courseCode) {
  if (!courseCode) return false;
  const upperCode = courseCode.toUpperCase().trim();
  return CSE_DEPT_PREFIXES.some(prefix => upperCode.startsWith(prefix));
}

/**
 * Determine if a course is a non-CSE department course
 * @param {string} courseCode - Course code
 * @returns {boolean} - True if it's a non-CSE department course
 */
export function isNonCseDepartmentCourse(courseCode) {
  if (!courseCode) return false;
  const upperCode = courseCode.toUpperCase().trim();
  return NON_CSE_DEPT_PREFIXES.some(prefix => upperCode.startsWith(prefix));
}

/**
 * Get the auto color for a course based on department and type
 * @param {string} courseCode - Course code (e.g., "CSE1101")
 * @param {string} courseType - Course type: 'Theory' or 'Lab'
 * @returns {string} - Hex color code
 */
export function getAutoColorForCourse(courseCode, courseType = 'Theory') {
  if (!courseCode) {
    return courseType === 'Lab' 
      ? DEPARTMENT_COLORS.cse.lab 
      : DEPARTMENT_COLORS.cse.theory;
  }

  const isCse = isCseDepartmentCourse(courseCode);
  const isLab = courseType === 'Lab';

  if (isCse) {
    return isLab ? DEPARTMENT_COLORS.cse.lab : DEPARTMENT_COLORS.cse.theory;
  } else {
    return isLab ? DEPARTMENT_COLORS.nonCse.lab : DEPARTMENT_COLORS.nonCse.theory;
  }
}

/**
 * Get the color category info for a course
 * @param {string} courseCode - Course code
 * @param {string} courseType - Course type
 * @returns {Object} - { category, type, color }
 */
export function getColorCategoryInfo(courseCode, courseType = 'Theory') {
  const isCse = isCseDepartmentCourse(courseCode);
  const isLab = courseType === 'Lab';
  
  let category = isCse ? 'CSE Dept' : 'Non-Dept';
  let colorSet = isCse ? DEPARTMENT_COLORS.cse : DEPARTMENT_COLORS.nonCse;
  let color = isLab ? colorSet.lab : colorSet.theory;
  
  return {
    category,
    type: isLab ? 'Lab' : 'Theory',
    color,
    isCse,
    isLab
  };
}

/**
 * Check if a color is "dark" (for text contrast decisions)
 * @param {string} hexColor - Hex color code
 * @returns {boolean} - True if the color is dark
 */
export function isDarkColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

/**
 * Get contrasting text color for a given background color
 * @param {string} backgroundColor - Hex color code
 * @returns {string} - 'white' or 'black'
 */
export function getContrastingTextColor(backgroundColor) {
  return isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
}
