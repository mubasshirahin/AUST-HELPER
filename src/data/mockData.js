// Mock data for the AUSTWise application
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

export const questionBank = [];

export const topicFrequency = {};

export const materialFolders = [];

export const playlists = [];

export const skillRoadmaps = [];

export const cheatsheets = [];

export const campusFloors = [
  { floor: 'Ground', mapImage: '/campus/ground-floor.png', rooms: [
    { id: 'G-01', name: 'M.H Khan Auditorium', type: 'hall', hotspot: { left: 18, top: 20, width: 12, height: 15 } },
    { id: 'G-02', name: 'Redex Photocopy', type: 'admin', hotspot: { left: 30, top: 20, width: 15, height: 15 } },
    { id: 'G-03', name: "Girl's Common Room", type: 'facility', hotspot: { left: 45, top: 15, width: 33, height: 10 } },
    { id: 'G-04', name: 'Badamtola', type: 'hall', hotspot: { left: 40, top: 35, width: 33, height: 30 } },
    { id: 'G-05', name: 'RedX', type: 'facility', hotspot: { left: 20, top: 40, width: 17, height: 40 } },
    { id: 'G-06', name: 'Canteen', type: 'facility', hotspot: { left: 73, top: 30, width: 16, height: 40 } },
    { id: 'G-07', name: 'TT Ground', type: 'facility', hotspot: { left: 42, top: 68, width: 45, height: 27 } },
    { id: 'G-LIFT', name: 'Lift', type: 'lift', hotspots: [
      { left: 8, top: 30, width: 6, height: 20 },
      { left: 8, top: 60, width: 6, height: 20 },
    ] },
    { id: 'G-M', name: 'Washroom', type: 'washroom', hotspot: { left: 86, top: 15, width: 8, height: 12 } },
  ]},
  { floor: '1st', mapImage: '/campus/first-floor.png', rooms: [
    { id: '1-PR', name: 'Prayer Room', type: 'facility', hotspot: { left: 18.7, top: 17.2, width: 2.9, height: 10.2 } },
    { id: '1-MC', name: 'Medical Center', type: 'facility', hotspot: { left: 21.1, top: 17.5, width: 12.5, height: 11.8 } },
    { id: '1-LIFT', name: 'Lift', type: 'lift', hotspots: [
      { left: 29.5, top: 14.8, width: 5.2, height: 6.8 },
      { left: 36.0, top: 14.8, width: 5.2, height: 6.8 },
      { left: 70.7, top: 11.8, width: 2.7, height: 7.8 },
      { left: 74.0, top: 11.6, width: 2.8, height: 7.8 },
      { left: 76.4, top: 66.0, width: 4.0, height: 18.5 },
    ] },
    { id: '2A03', name: 'Room 2A03', type: 'classroom', hotspot: { left: 41.2, top: 15.2, width: 5.3, height: 6.3 } },
    { id: '2A04', name: 'Room 2A04', type: 'classroom', hotspot: { left: 46.6, top: 14.8, width: 5.2, height: 6.5 } },
    { id: '2A05', name: 'Room 2A05', type: 'classroom', hotspot: { left: 51.8, top: 14.6, width: 5.3, height: 6.4 } },
    { id: '2A06', name: 'Room 2A06', type: 'classroom', hotspot: { left: 57.1, top: 14.2, width: 5.1, height: 6.5 } },
    { id: '2A07', name: 'Room 2A07', type: 'classroom', hotspot: { left: 62.2, top: 13.8, width: 5.2, height: 6.6 } },
    { id: '1-WR', name: 'Washroom', type: 'washroom', hotspot: { left: 77.5, top: 11.0, width: 3.6, height: 7.3 } },
    { id: '1-PZ', name: 'Plaza', type: 'facility', hotspot: { left: 20.0, top: 31.4, width: 15.2, height: 17.2 } },
    { id: '1-BD', name: 'Badamtola', type: 'hall', hotspot: { left: 34.0, top: 25.6, width: 33.5, height: 38.4 } },
    { id: '1-LIB', name: 'Library', type: 'library', hotspot: { left: 66.8, top: 25.6, width: 14.2, height: 39.0 } },
    { id: '1-PRC', name: 'Proctor Room', type: 'admin', hotspot: { left: 6.6, top: 48.8, width: 13.8, height: 15.0 } },
    { id: '1-ID', name: 'Information Desk', type: 'admin', hotspot: { left: 20.7, top: 63.5, width: 12.1, height: 7.8 } },
    { id: '1-APS', name: 'Architecture Project Showcase', type: 'facility', hotspot: { left: 34.2, top: 56.7, width: 7.5, height: 10.8 } },
    { id: '1-SR', name: 'Study Room', type: 'library', hotspot: { left: 66.4, top: 78.2, width: 9.6, height: 5.9 } },
  ]},
  { floor: '2nd', rooms: [
    { id: '2A-01', name: 'Room 2A-01', type: 'classroom', x: 18, y: 28 },
    { id: '2A-02', name: 'Room 2A-02', type: 'classroom', x: 38, y: 28 },
    { id: '2A-03', name: 'Room 2A-03', type: 'classroom', x: 58, y: 28 },
    { id: '2B-01', name: 'Room 2B-01', type: 'classroom', x: 78, y: 28 },
    { id: '2B-02', name: 'Drawing Lab', type: 'lab', x: 32, y: 66 },
    { id: '2B-03', name: 'Faculty Room', type: 'admin', x: 62, y: 66 },
    { id: '2-LIFT', name: 'Lift', type: 'lift', x: 8, y: 32 },
    { id: '2-M', name: 'Washroom', type: 'washroom', x: 90, y: 22 },
  ]},
  { floor: '3rd', rooms: [
    { id: '3A-01', name: 'Room 3A-01', type: 'classroom', x: 18, y: 28 },
    { id: '3A-02', name: 'Room 3A-02', type: 'classroom', x: 38, y: 28 },
    { id: '3A-03', name: 'Room 3A-03', type: 'classroom', x: 58, y: 28 },
    { id: '3B-01', name: 'Room 3B-01', type: 'classroom', x: 78, y: 28 },
    { id: '3B-02', name: 'Computer Lab', type: 'lab', x: 32, y: 66 },
    { id: '3B-03', name: 'Department Office', type: 'admin', x: 62, y: 66 },
    { id: '3-LIFT', name: 'Lift', type: 'lift', x: 8, y: 32 },
    { id: '3-M', name: 'Washroom', type: 'washroom', x: 90, y: 22 },
  ]},
  { floor: '4th', rooms: [
    { id: '4A-01', name: 'CSE Lab 1', type: 'lab', x: 20, y: 30 },
    { id: '4A-02', name: 'CSE Lab 2', type: 'lab', x: 50, y: 30 },
    { id: '4A-03', name: 'Room 4A-03', type: 'classroom', x: 80, y: 30 },
    { id: '4B-01', name: 'CSE Office', type: 'admin', x: 30, y: 65 },
    { id: '4B-02', name: 'Seminar Room', type: 'hall', x: 60, y: 65 },
    { id: '4-LIFT', name: 'Lift', type: 'lift', x: 8, y: 30 },
    { id: '4-M', name: 'Washroom', type: 'washroom', x: 90, y: 20 },
  ]},
  { floor: '5th', rooms: [
    { id: '5A-01', name: 'Room 5A-01', type: 'classroom', x: 20, y: 30 },
    { id: '5B-01', name: 'Room 5B-01', type: 'classroom', x: 50, y: 30 },
    { id: '5B-02', name: 'Room 5B-02', type: 'classroom', x: 80, y: 30 },
    { id: '5C-01', name: 'Software Lab', type: 'lab', x: 35, y: 65 },
    { id: '5C-02', name: 'Network Lab', type: 'lab', x: 65, y: 65 },
    { id: '5-LIFT', name: 'Lift', type: 'lift', x: 8, y: 30 },
    { id: '5-M', name: 'Washroom', type: 'washroom', x: 90, y: 20 },
  ]},
  { floor: '6th', rooms: [
    { id: '6A-01', name: 'Room 6A-01', type: 'classroom', x: 15, y: 25 },
    { id: '6A-02', name: 'Room 6A-02', type: 'classroom', x: 35, y: 25 },
    { id: '6A-03', name: 'Room 6A-03', type: 'classroom', x: 55, y: 25 },
    { id: '6A-04', name: 'Room 6A-04', type: 'classroom', x: 75, y: 25 },
    { id: '6B-01', name: 'Faculty Room', type: 'admin', x: 40, y: 65 },
    { id: '6-LIFT', name: 'Lift', type: 'lift', x: 8, y: 30 },
    { id: '6-M', name: 'Washroom', type: 'washroom', x: 90, y: 20 },
  ]},
  { floor: '7th', rooms: [
    { id: '7A-01', name: 'Room 7A-01', type: 'classroom', x: 15, y: 25 },
    { id: '7A-02', name: 'Room 7A-02', type: 'classroom', x: 35, y: 25 },
    { id: '7A-03', name: 'Room 7A-03', type: 'classroom', x: 55, y: 25 },
    { id: '7A-04', name: 'Room 7A-04', type: 'classroom', x: 75, y: 25 },
    { id: '7B-01', name: 'Project Lab', type: 'lab', x: 30, y: 65 },
    { id: '7B-02', name: 'Seminar Room', type: 'hall', x: 60, y: 65 },
    { id: '7-LIFT', name: 'Lift', type: 'lift', x: 8, y: 30 },
    { id: '7-M', name: 'Washroom', type: 'washroom', x: 90, y: 20 },
  ]},
  { floor: '8th', rooms: [
    { id: '8A-01', name: 'Room 8A-01', type: 'classroom', x: 15, y: 25 },
    { id: '8A-02', name: 'Room 8A-02', type: 'classroom', x: 35, y: 25 },
    { id: '8A-03', name: 'Room 8A-03', type: 'classroom', x: 55, y: 25 },
    { id: '8A-04', name: 'Room 8A-04', type: 'classroom', x: 75, y: 25 },
    { id: '8B-01', name: 'Research Lab', type: 'lab', x: 30, y: 65 },
    { id: '8B-02', name: 'Faculty Room', type: 'admin', x: 60, y: 65 },
    { id: '8-LIFT', name: 'Lift', type: 'lift', x: 8, y: 30 },
    { id: '8-M', name: 'Washroom', type: 'washroom', x: 90, y: 20 },
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
    { hour: '8AM', occupancy: 18 }, { hour: '9AM', occupancy: 32 }, { hour: '10AM', occupancy: 55 },
    { hour: '11AM', occupancy: 68 }, { hour: '12PM', occupancy: 74 }, { hour: '1PM', occupancy: 46 },
    { hour: '2PM', occupancy: 62 }, { hour: '3PM', occupancy: 81 }, { hour: '4PM', occupancy: 88 },
    { hour: '5PM', occupancy: 72 }, { hour: '6PM', occupancy: 51 },
  ]
};

export const canteenData = {
  status: 'open',
  crowdLevel: 55,
  hours: '8:00 AM - 7:00 PM',
  menu: [
    { id: 1, name: 'Chicken Khichuri', category: 'Meals', price: 70, popular: true, available: true },
    { id: 2, name: 'Beef Tehari', category: 'Meals', price: 90, popular: true, available: true },
    { id: 3, name: 'Vegetable Singara', category: 'Snacks', price: 10, popular: false, available: true },
    { id: 4, name: 'Samosa', category: 'Snacks', price: 12, popular: false, available: true },
    { id: 5, name: 'Chicken Burger', category: 'Fast Food', price: 120, popular: true, available: true },
    { id: 6, name: 'French Fries', category: 'Fast Food', price: 60, popular: false, available: false },
    { id: 7, name: 'Milk Tea', category: 'Beverages', price: 15, popular: true, available: true },
    { id: 8, name: 'Cold Coffee', category: 'Beverages', price: 50, popular: false, available: true },
    { id: 9, name: 'Firni', category: 'Dessert', price: 40, popular: false, available: true },
  ]
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
