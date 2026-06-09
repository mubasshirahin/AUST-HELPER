const storageKey = 'aust-marketplace-v1';
const contributorKey = 'aust-marketplace-contributor-id';
const userStorageKey = 'aust-user-profile';

const emptyStore = () => ({
  exchange: [],
  tolet: [],
  lostFound: [],
  partners: [],
  mentors: [],
});

export function getContributorId() {
  try {
    const existing = localStorage.getItem(contributorKey);
    if (existing) return existing;
    const nextId = crypto.randomUUID();
    localStorage.setItem(contributorKey, nextId);
    return nextId;
  } catch {
    return `local-${Date.now()}`;
  }
}

function loadUserProfile() {
  try {
    const savedUser = localStorage.getItem(userStorageKey);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function getBatchNoFromUser(user = loadUserProfile()) {
  if (user?.batchNo) return String(user.batchNo);
  const batchDigits = String(user?.batch || '').match(/\d+/)?.[0];
  return batchDigits || '';
}

export function getSellerLabel(user = loadUserProfile()) {
  if (!user) return 'AUST User';
  const department = user.department ? ` • ${user.department}` : '';
  if (user.role === 'faculty') return `Faculty${department}`;
  if (user.role === 'alumni') {
    const batchNo = getBatchNoFromUser(user);
    return batchNo ? `Alumni • Batch ${batchNo}${department}` : `Alumni${department}`;
  }
  const batchNo = getBatchNoFromUser(user);
  return batchNo ? `Batch ${batchNo}${department}` : user.name || 'AUST Student';
}

export function getUserInitials(name) {
  const initials = String(name || 'ST')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'ST';
}

const seedData = {
  exchange: [
    { id: 'seed-ex-1', contributorId: 'seed', postedAt: new Date(Date.now() - 1 * 86400000).toISOString(), title: 'Calculus by Thomas (10th Ed)', price: 350, condition: 'Good', category: 'Books', image: '📘', seller: 'Batch 62 • CSE', contact: '+8801712345678' },
    { id: 'seed-ex-2', contributorId: 'seed', postedAt: new Date(Date.now() - 2 * 86400000).toISOString(), title: 'Breadboard + Jumper Wire Kit', price: 180, condition: 'Like New', category: 'Lab Equipment', image: '🔧', seller: 'Batch 61 • EEE', contact: '+8801898765432' },
    { id: 'seed-ex-3', contributorId: 'seed', postedAt: new Date(Date.now() - 3 * 86400000).toISOString(), title: 'Scientific Calculator (Casio fx-991EX)', price: 550, condition: 'Good', category: 'Electronics', image: '🧮', seller: 'Batch 63 • CSE', contact: '+8801611223344' },
    { id: 'seed-ex-4', contributorId: 'seed', postedAt: new Date(Date.now() - 5 * 86400000).toISOString(), title: 'Data Structures & Algorithms Book', price: 400, condition: 'Fair', category: 'Books', image: '📗', seller: 'Batch 60 • CSE', contact: '+8801755443322' },
  ],
  tolet: [
    { id: 'seed-tl-1', contributorId: 'seed', postedAt: new Date(Date.now() - 1 * 86400000).toISOString(), title: 'Bachelor Seat in Tejgaon', location: 'Tejgaon, 5 min from AUST', rent: 2500, type: 'Seat', amenities: ['WiFi', 'Mess', 'Security'], available: true, contact: '+8801812345678', owner: 'AUST Alumni' },
    { id: 'seed-tl-2', contributorId: 'seed', postedAt: new Date(Date.now() - 3 * 86400000).toISOString(), title: 'Single Room Near Campus Gate', location: 'Farmgate, 8 min walk', rent: 4200, type: 'Room', amenities: ['WiFi', 'AC', 'Attached Bath'], available: true, contact: '+8801923456789', owner: 'Faculty • CSE' },
    { id: 'seed-tl-3', contributorId: 'seed', postedAt: new Date(Date.now() - 7 * 86400000).toISOString(), title: '2-Bedroom Flat for Sharing', location: 'Bijoy Sarani', rent: 8000, type: 'Flat', amenities: ['WiFi', 'Kitchen', 'Lift', 'Security'], available: true, contact: '+8801611334455', owner: 'Batch 58 • Alumni' },
  ],
  lostFound: [
    { id: 'seed-lf-1', contributorId: 'seed', postedAt: new Date(Date.now() - 1 * 86400000).toISOString(), title: 'Blue Water Bottle', type: 'lost', location: '6th Floor Cafeteria', description: 'Blue Tupperware bottle with AUST sticker on it. Left near the corner table during lunch.', image: '🎒', status: 'open', contact: '+8801712334455', reporter: 'Batch 63 • CSE' },
    { id: 'seed-lf-2', contributorId: 'seed', postedAt: new Date(Date.now() - 2 * 86400000).toISOString(), title: 'Student ID Card', type: 'found', location: 'Library Reading Room', description: 'Found a student ID card (CSE dept) on the table near the window. Contact to claim.', image: '🪪', status: 'open', contact: '+8801812223344', reporter: 'Batch 62 • CSE' },
    { id: 'seed-lf-3', contributorId: 'seed', postedAt: new Date(Date.now() - 4 * 86400000).toISOString(), title: 'Black Umbrella', type: 'lost', location: 'Lab 7B08', description: 'Left a black folding umbrella after the CS lab session on Tuesday.', image: '☂️', status: 'open', contact: '+8801955667788', reporter: 'Batch 63 • EEE' },
  ],
  partners: [
    { id: 'seed-sp-1', contributorId: 'seed-p1', postedAt: new Date(Date.now() - 2 * 86400000).toISOString(), name: 'Arafat Hossain', batch: '63', department: 'CSE', skills: ['Python', 'Data Structures', 'SQL'], lookingFor: ['Machine Learning', 'React'], contact: '+8801712001122', avatar: 'AH' },
    { id: 'seed-sp-2', contributorId: 'seed-p2', postedAt: new Date(Date.now() - 3 * 86400000).toISOString(), name: 'Nusrat Jahan', batch: '62', department: 'CSE', skills: ['React', 'JavaScript', 'CSS'], lookingFor: ['Node.js', 'System Design'], contact: '+8801811002233', avatar: 'NJ' },
    { id: 'seed-sp-3', contributorId: 'seed-p3', postedAt: new Date(Date.now() - 5 * 86400000).toISOString(), name: 'Tanvir Ahmed', batch: '63', department: 'CSE', skills: ['C++', 'Algorithms', 'Competitive Programming'], lookingFor: ['Project Partners', 'Hackathon Team'], contact: '+8801919003344', avatar: 'TA' },
  ],
  mentors: [
    { id: 'seed-m1', contributorId: 'seed-m1', postedAt: new Date(Date.now() - 5 * 86400000).toISOString(), name: 'Rafiqul Islam', batch: '55', expertise: 'Software Engineering, System Design', company: 'Samsung R&D Bangladesh', availability: 'Weekends, Online', contact: '+8801812334455', avatar: 'RI', sessions: 12, rating: 5 },
    { id: 'seed-m2', contributorId: 'seed-m2', postedAt: new Date(Date.now() - 10 * 86400000).toISOString(), name: 'Shirin Akter', batch: '57', expertise: 'Machine Learning, Python, Data Science', company: 'Pathao', availability: 'Thursday evenings', contact: '+8801711445566', avatar: 'SA', sessions: 8, rating: 5 },
  ],
};

function loadStore() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { ...seedData };
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return { ...seedData };
  }
}

function saveStore(store) {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

export function formatPostedDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'recently';

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function createBaseEntry() {
  return {
    id: crypto.randomUUID(),
    contributorId: getContributorId(),
    postedAt: new Date().toISOString(),
  };
}

export function listExchangeItems() {
  return loadStore().exchange.sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
}

export function addExchangeItem(payload) {
  const title = String(payload.title || '').trim();
  const price = Number(payload.price);
  const contact = String(payload.contact || '').trim();

  if (!title) throw new Error('Product title is required.');
  if (!Number.isFinite(price) || price < 0) throw new Error('Enter a valid price.');
  if (!contact) throw new Error('Contact number is required.');

  const store = loadStore();
  const entry = {
    ...createBaseEntry(),
    title,
    price: Math.round(price),
    condition: payload.condition || 'Good',
    category: payload.category || 'Other',
    image: payload.image || '📦',
    seller: payload.seller || getSellerLabel(),
    contact,
  };

  store.exchange.unshift(entry);
  saveStore(store);
  return entry;
}

export function listToLetListings() {
  return loadStore().tolet.sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
}

export function addToLetListing(payload) {
  const title = String(payload.title || '').trim();
  const location = String(payload.location || '').trim();
  const rent = Number(payload.rent);
  const contact = String(payload.contact || '').trim();

  if (!title || !location) throw new Error('Title and location are required.');
  if (!Number.isFinite(rent) || rent < 0) throw new Error('Enter a valid monthly rent.');
  if (!contact) throw new Error('Contact number is required.');

  const store = loadStore();
  const entry = {
    ...createBaseEntry(),
    title,
    location,
    rent: Math.round(rent),
    type: payload.type || 'Seat',
    amenities: (payload.amenities || []).filter(Boolean),
    available: true,
    contact,
    owner: payload.owner || getSellerLabel(),
  };

  store.tolet.unshift(entry);
  saveStore(store);
  return entry;
}

export function setToLetAvailability(id, available) {
  const store = loadStore();
  store.tolet = store.tolet.map((listing) => (
    listing.id === id ? { ...listing, available: Boolean(available) } : listing
  ));
  saveStore(store);
  return store.tolet;
}

export function listLostFoundItems() {
  return loadStore().lostFound.sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
}

export function addLostFoundItem(payload) {
  const title = String(payload.title || '').trim();
  const location = String(payload.location || '').trim();
  const description = String(payload.description || '').trim();
  const contact = String(payload.contact || '').trim();
  const type = payload.type === 'found' ? 'found' : 'lost';

  if (!title || !location || !description) {
    throw new Error('Title, location, and description are required.');
  }
  if (!contact) throw new Error('Contact number is required.');

  const store = loadStore();
  const entry = {
    ...createBaseEntry(),
    title,
    location,
    description,
    type,
    image: payload.image || (type === 'lost' ? '❓' : '✨'),
    status: 'open',
    contact,
    reporter: payload.reporter || getSellerLabel(),
  };

  store.lostFound.unshift(entry);
  saveStore(store);
  return entry;
}

export function claimLostFoundItem(id) {
  const store = loadStore();
  let updated = null;

  store.lostFound = store.lostFound.map((item) => {
    if (item.id !== id) return item;
    if (item.status === 'claimed') return item;
    updated = { ...item, status: 'claimed', claimedAt: new Date().toISOString() };
    return updated;
  });

  if (!updated) throw new Error('Item not found or already claimed.');
  saveStore(store);
  return updated;
}

export function listStudyPartners() {
  return loadStore().partners.sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
}

function splitTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function calcPartnerCompatibility(leftSkills, rightSkills) {
  if (!leftSkills.length || !rightSkills.length) return 50;
  const left = new Set(leftSkills.map((skill) => skill.toLowerCase()));
  const right = new Set(rightSkills.map((skill) => skill.toLowerCase()));
  let overlap = 0;
  for (const skill of left) {
    if (right.has(skill)) overlap += 1;
  }
  const score = Math.round((overlap / Math.max(left.size, right.size)) * 100);
  return Math.max(35, Math.min(98, score || 50));
}

export function addStudyPartner(payload) {
  const name = String(payload.name || '').trim();
  const contact = String(payload.contact || '').trim();
  const skills = splitTags(payload.skills);
  const lookingFor = splitTags(payload.lookingFor);

  if (!name) throw new Error('Your name is required.');
  if (!skills.length || !lookingFor.length) {
    throw new Error('Add at least one skill and one topic you are looking for.');
  }
  if (!contact) throw new Error('Contact number is required.');

  const user = loadUserProfile();
  const store = loadStore();
  const contributorId = getContributorId();

  store.partners = store.partners.filter((partner) => partner.contributorId !== contributorId);

  const entry = {
    ...createBaseEntry(),
    name,
    batch: payload.batch || getBatchNoFromUser(user) || '—',
    department: payload.department || user.department || '—',
    skills,
    lookingFor,
    contact,
    avatar: getUserInitials(name),
  };

  store.partners.unshift(entry);
  saveStore(store);
  return entry;
}

export function getMyStudyPartner() {
  const contributorId = getContributorId();
  return listStudyPartners().find((partner) => partner.contributorId === contributorId) || null;
}

export function listMentors() {
  return loadStore().mentors.sort(
    (left, right) => new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime(),
  );
}

export function addMentor(payload) {
  const name = String(payload.name || '').trim();
  const expertise = String(payload.expertise || '').trim();
  const company = String(payload.company || '').trim();
  const availability = String(payload.availability || '').trim();
  const contact = String(payload.contact || '').trim();

  if (!name || !expertise || !availability) {
    throw new Error('Name, expertise, and availability are required.');
  }
  if (!contact) throw new Error('Contact number is required.');

  const user = loadUserProfile();
  const store = loadStore();
  const contributorId = getContributorId();

  store.mentors = store.mentors.filter((mentor) => mentor.contributorId !== contributorId);

  const entry = {
    ...createBaseEntry(),
    name,
    batch: payload.batch || getBatchNoFromUser(user) || '—',
    expertise,
    company: company || '—',
    availability,
    contact,
    avatar: getUserInitials(name),
    sessions: 0,
    rating: 5,
  };

  store.mentors.unshift(entry);
  saveStore(store);
  return entry;
}

export function incrementMentorSessions(id) {
  const store = loadStore();
  store.mentors = store.mentors.map((mentor) => (
    mentor.id === id ? { ...mentor, sessions: (mentor.sessions || 0) + 1 } : mentor
  ));
  saveStore(store);
  return store.mentors;
}

export async function copyContact(contact, label = 'Contact') {
  const value = String(contact || '').trim();
  if (!value) {
    throw new Error(`${label} is not available for this listing.`);
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return `${label} copied: ${value}`;
  }
  return `${label}: ${value}`;
}
