import { questionBank as builtInQuestionBank } from '../data/mockData';
import { getSellerLabel } from './marketplaceStorage';

const storageKey = 'aust-question-bank-user-v1';
const userStorageKey = 'aust-user-profile';
export const MAX_QUESTION_PAPER_BYTES = 200 * 1024 * 1024;

function formatMaxFileSize(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

function loadUserProfile() {
  try {
    const savedUser = localStorage.getItem(userStorageKey);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function loadUserQuestions() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserQuestions(items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    throw new Error(
      'Could not save this file. Your browser storage may be full — try a smaller file or remove old uploads.',
    );
  }
}

export function getAllQuestionBankItems() {
  return [...builtInQuestionBank, ...loadUserQuestions()];
}

export function addQuestionPaper(payload) {
  const type = String(payload.type || '').trim();
  const questions = Number(payload.questions);
  const fileData = String(payload.fileData || '').trim();
  const fileName = String(payload.fileName || '').trim();

  if (!['Mid', 'Final', 'Quiz'].includes(type)) {
    throw new Error('Select a valid exam type.');
  }
  if (!Number.isFinite(questions) || questions < 1) {
    throw new Error('Enter how many questions are in the paper.');
  }
  if (!fileData || !fileName) {
    throw new Error('Upload a PDF or image of the question paper.');
  }

  const profile = loadUserProfile();
  const entry = {
    id: `user-${crypto.randomUUID()}`,
    isUserUpload: true,
    contributorId: profile?.id || 'guest',
    contributorName: getSellerLabel(profile),
    department: payload.department,
    yearSem: payload.yearSem,
    course: payload.course,
    name: payload.name,
    type,
    year: payload.year,
    semester: payload.semester,
    questions: Math.round(questions),
    solved: Boolean(payload.solved),
    fileName,
    fileData,
    fileType: payload.fileType || 'pdf',
    uploadedAt: new Date().toISOString(),
  };

  const nextItems = [entry, ...loadUserQuestions()];
  saveUserQuestions(nextItems);
  return entry;
}

export function deleteQuestionPaper(id, userId, isAdmin = false) {
  const items = loadUserQuestions();
  const target = items.find((item) => item.id === id);
  if (!target) throw new Error('Question paper not found.');
  if (!isAdmin && target.contributorId !== userId) {
    throw new Error('You can only delete your own uploads.');
  }

  const nextItems = items.filter((item) => item.id !== id);
  saveUserQuestions(nextItems);
}

export function downloadQuestionPaper(item) {
  if (!item.fileData) {
    throw new Error('No file attached to this paper.');
  }

  const link = document.createElement('a');
  link.href = item.fileData;
  link.download = item.fileName || `${item.course}-${item.type}-${item.year}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function readQuestionPaperFile(file, maxBytes = MAX_QUESTION_PAPER_BYTES) {
  if (!file) throw new Error('Choose a file to upload.');
  if (file.size > maxBytes) {
    throw new Error(`File must be under ${formatMaxFileSize(maxBytes)}.`);
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Upload a PDF, JPG, PNG, or WEBP file.');
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });

  return {
    fileData: dataUrl,
    fileName: file.name,
    fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
  };
}
