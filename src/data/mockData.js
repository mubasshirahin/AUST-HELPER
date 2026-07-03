// Mock data for the AUST Student Helper application
// All data is realistic but fictional

export const currentUser = {
  id: '',
  name: '',
  email: '',
  department: '',
  batch: '',
  semester: 1,
  section: '',
  avatar: null,
  initials: '',
  cgpa: 0,
  creditsCompleted: 0,
  totalCredits: 160,
};

export const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export const routineData = {
  Sunday: [],
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
};

export const attendanceData = [];

export const deadlines = [];

export const notices = [];

export const semesterResults = [];

export const syllabusData = [];

export const questionBank = [
  { id: 1, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Mid', year: 2025, semester: 'Fall', questions: 8, solved: true },
  { id: 2, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Mid', year: 2025, semester: 'Spring', questions: 7, solved: true },
  { id: 3, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Final', year: 2024, semester: 'Spring', questions: 10, solved: false },
  { id: 4, department: 'CSE', yearSem: '3.2', course: 'CSE 3101', name: 'Database Systems', type: 'Final', year: 2024, semester: 'Fall', questions: 9, solved: true },
  { id: 5, department: 'CSE', yearSem: '3.1', course: 'CSE 3103', name: 'Computer Networks', type: 'Mid', year: 2025, semester: 'Spring', questions: 6, solved: false },
  { id: 6, department: 'CSE', yearSem: '3.1', course: 'CSE 3103', name: 'Computer Networks', type: 'Mid', year: 2024, semester: 'Spring', questions: 7, solved: true },
  { id: 7, department: 'CSE', yearSem: '3.2', course: 'CSE 3103', name: 'Computer Networks', type: 'Final', year: 2024, semester: 'Spring', questions: 8, solved: false },
  { id: 8, department: 'CSE', yearSem: '3.2', course: 'CSE 3111', name: 'Software Engineering', type: 'Mid', year: 2025, semester: 'Spring', questions: 5, solved: true },
  { id: 9, department: 'CSE', yearSem: '3.2', course: 'CSE 3111', name: 'Software Engineering', type: 'Final', year: 2024, semester: 'Spring', questions: 8, solved: true },
  { id: 10, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Quiz', year: 2025, semester: 'Spring', questions: 3, solved: true },
  { id: 22, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Final', year: 2025, semester: 'Fall', questions: 9, solved: false },
  { id: 23, department: 'CSE', yearSem: '3.1', course: 'CSE 3101', name: 'Database Systems', type: 'Mid', year: 2023, semester: 'Fall', questions: 6, solved: true },
  { id: 11, department: 'EEE', yearSem: '3.1', course: 'EEE 3101', name: 'Power Systems', type: 'Mid', year: 2025, semester: 'Spring', questions: 6, solved: true },
  { id: 12, department: 'EEE', yearSem: '3.2', course: 'EEE 3101', name: 'Power Systems', type: 'Final', year: 2024, semester: 'Spring', questions: 8, solved: false },
  { id: 13, department: 'EEE', yearSem: '3.1', course: 'EEE 3203', name: 'Digital Signal Processing', type: 'Mid', year: 2024, semester: 'Fall', questions: 5, solved: true },
  { id: 14, department: 'CE', yearSem: '3.1', course: 'CE 3101', name: 'Structural Analysis', type: 'Mid', year: 2025, semester: 'Spring', questions: 7, solved: false },
  { id: 15, department: 'CE', yearSem: '3.2', course: 'CE 3101', name: 'Structural Analysis', type: 'Final', year: 2024, semester: 'Spring', questions: 9, solved: true },
  { id: 16, department: 'ME', yearSem: '3.1', course: 'ME 3101', name: 'Thermodynamics', type: 'Mid', year: 2025, semester: 'Spring', questions: 6, solved: true },
  { id: 17, department: 'IPE', yearSem: '3.2', course: 'IPE 3101', name: 'Production Planning', type: 'Final', year: 2024, semester: 'Spring', questions: 7, solved: false },
  { id: 18, department: 'TE', yearSem: '2.2', course: 'TE 3101', name: 'Yarn Manufacturing', type: 'Mid', year: 2025, semester: 'Spring', questions: 5, solved: true },
  { id: 19, department: 'ARCH', yearSem: '4.1', course: 'ARCH 3101', name: 'Building Design', type: 'Mid', year: 2024, semester: 'Fall', questions: 6, solved: true },
  { id: 20, department: 'ARCH', yearSem: '5.2', course: 'ARCH 4101', name: 'Urban Planning', type: 'Final', year: 2025, semester: 'Spring', questions: 8, solved: false },
  { id: 21, department: 'BBA', yearSem: '3.1', course: 'BBA 3101', name: 'Financial Management', type: 'Final', year: 2025, semester: 'Spring', questions: 8, solved: false },
];

export const topicFrequency = {};

export const materialFolders = [];

export const playlists = [];

export const skillRoadmaps = [];

export const cheatsheets = [];

export const campusFloors = [
  { floor: 'Ground', rooms: [
    { id: 'G-01', name: 'Main Office', type: 'admin', x: 20, y: 30 },
    { id: 'G-02', name: 'Registrar', type: 'admin', x: 40, y: 30 },
    { id: 'G-03', name: 'Auditorium', type: 'hall', x: 70, y: 50 },
    { id: 'G-04', name: 'Canteen', type: 'facility', x: 30, y: 70 },
    { id: 'G-05', name: 'Library (Ground)', type: 'library', x: 60, y: 70 },
  ]},
  { floor: '1st', rooms: [
    { id: '1A-01', name: 'Room 1A-01', type: 'classroom', x: 15, y: 25 },
    { id: '1A-02', name: 'Room 1A-02', type: 'classroom', x: 35, y: 25 },
    { id: '1A-03', name: 'Room 1A-03', type: 'classroom', x: 55, y: 25 },
    { id: '1B-01', name: 'EEE Lab 1', type: 'lab', x: 75, y: 25 },
    { id: '1B-02', name: 'Physics Lab', type: 'lab', x: 30, y: 65 },
  ]},
  { floor: '4th', rooms: [
    { id: '4A-01', name: 'CSE Lab 1', type: 'lab', x: 20, y: 30 },
    { id: '4A-02', name: 'CSE Lab 2', type: 'lab', x: 50, y: 30 },
    { id: '4A-03', name: 'Room 4A-03', type: 'classroom', x: 80, y: 30 },
    { id: '4B-01', name: 'CSE Office', type: 'admin', x: 30, y: 65 },
    { id: '4B-02', name: 'Seminar Room', type: 'hall', x: 60, y: 65 },
  ]},
  { floor: '5th', rooms: [
    { id: '5A-01', name: 'Room 5A-01', type: 'classroom', x: 20, y: 30 },
    { id: '5B-01', name: 'Room 5B-01', type: 'classroom', x: 50, y: 30 },
    { id: '5B-02', name: 'Room 5B-02', type: 'classroom', x: 80, y: 30 },
    { id: '5C-01', name: 'Software Lab', type: 'lab', x: 35, y: 65 },
    { id: '5C-02', name: 'Network Lab', type: 'lab', x: 65, y: 65 },
  ]},
  { floor: '6th', rooms: [
    { id: '6A-01', name: 'Room 6A-01', type: 'classroom', x: 15, y: 25 },
    { id: '6A-02', name: 'Room 6A-02', type: 'classroom', x: 35, y: 25 },
    { id: '6A-03', name: 'Room 6A-03', type: 'classroom', x: 55, y: 25 },
    { id: '6A-04', name: 'Room 6A-04', type: 'classroom', x: 75, y: 25 },
    { id: '6B-01', name: 'Faculty Room', type: 'admin', x: 40, y: 65 },
  ]},
];

export const examSeats = [];

export const facultyData = [];

export const libraryData = {
  totalSeats: 120,
  occupied: 0,
  zones: [
    { name: 'Silent Zone', seats: 40, occupied: 0, noise: 'quiet' },
    { name: 'Group Study', seats: 30, occupied: 0, noise: 'moderate' },
    { name: 'Computer Lab', seats: 20, occupied: 0, noise: 'quiet' },
    { name: 'Reading Area', seats: 30, occupied: 0, noise: 'quiet' },
  ],
  peakHours: [
    { hour: '8AM', occupancy: 0 }, { hour: '9AM', occupancy: 0 }, { hour: '10AM', occupancy: 0 },
    { hour: '11AM', occupancy: 0 }, { hour: '12PM', occupancy: 0 }, { hour: '1PM', occupancy: 0 },
    { hour: '2PM', occupancy: 0 }, { hour: '3PM', occupancy: 0 }, { hour: '4PM', occupancy: 0 },
    { hour: '5PM', occupancy: 0 }, { hour: '6PM', occupancy: 0 }, { hour: '7PM', occupancy: 0 },
  ]
};

export const canteenData = {
  status: 'closed',
  crowdLevel: 0,
  hours: '8:00 AM - 7:00 PM',
  menu: []
};

export const prerequisiteTree = {
  nodes: [
    { id: 'CSE1101', name: 'Intro to Programming', semester: 1, status: 'locked' },
    { id: 'CSE1201', name: 'Data Structures', semester: 2, status: 'locked', prereqs: ['CSE1101'] },
    { id: 'CSE2101', name: 'OOP', semester: 3, status: 'locked', prereqs: ['CSE1201'] },
    { id: 'CSE2201', name: 'Algorithms', semester: 4, status: 'locked', prereqs: ['CSE1201'] },
    { id: 'CSE3001', name: 'Operating Systems', semester: 5, status: 'locked', prereqs: ['CSE2201'] },
    { id: 'CSE3101', name: 'Database Systems', semester: 6, status: 'locked', prereqs: ['CSE2201'] },
    { id: 'CSE3103', name: 'Computer Networks', semester: 6, status: 'locked', prereqs: ['CSE2201'] },
    { id: 'CSE3111', name: 'Software Engineering', semester: 6, status: 'locked', prereqs: ['CSE2101'] },
    { id: 'CSE4101', name: 'Compiler Design', semester: 7, status: 'locked', prereqs: ['CSE3001'] },
    { id: 'CSE4103', name: 'AI', semester: 7, status: 'locked', prereqs: ['CSE2201', 'MATH2201'] },
    { id: 'CSE4201', name: 'Machine Learning', semester: 8, status: 'locked', prereqs: ['CSE4103'] },
    { id: 'MATH2201', name: 'Probability & Stats', semester: 4, status: 'locked', prereqs: [] },
  ]
};

export const anonymousStories = [];

export const seniorSecrets = [];

export const alumniData = [];

export const clubsData = [];

export const feedbackItems = [];
