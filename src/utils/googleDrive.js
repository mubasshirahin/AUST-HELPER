// Google Drive API Utility
// Fetches files from shared Google Drive folders

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

// Extract folder ID from Google Drive URL
export function extractFolderId(url) {
  if (!url) return null;

  // Handle direct folder IDs
  if (/^[a-zA-Z0-9_-]+$/.test(url) && url.length > 10) {
    return url;
  }

  // Handle full URLs
  const patterns = [
    /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/folderview\?.*id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/folder\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Fetch files from a Google Drive folder
export async function fetchDriveFolderFiles(folderId, accessToken) {
  if (!folderId || !accessToken) {
    throw new Error('Folder ID and access token are required');
  }

  const query = `'${folderId}' in parents and trashed = false`;
  const fields = 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, iconLink)';

  let allFiles = [];
  let pageToken = null;

  do {
    const params = new URLSearchParams({
      q: query,
      fields: `nextPageToken, ${fields}`,
      pageSize: '100',
      orderBy: 'name',
      ...(pageToken && { pageToken }),
    });

    const res = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error?.message || `Drive API error: ${res.status}`);
    }

    const data = await res.json();
    allFiles = [...allFiles, ...(data.files || [])];
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allFiles;
}

// Get file type category from MIME type
export function getFileCategory(mimeType) {
  if (!mimeType) return 'other';

  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('folder')) return 'folder';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';

  return 'other';
}

// Get file icon based on MIME type
export function getFileIcon(mimeType) {
  const category = getFileCategory(mimeType);
  const icons = {
    pdf: '📄',
    image: '🖼️',
    video: '🎬',
    spreadsheet: '📊',
    document: '📝',
    presentation: '📽️',
    folder: '📁',
    archive: '📦',
    other: '📎',
  };
  return icons[category] || icons.other;
}

// Format file size
export function formatFileSize(bytes) {
  if (!bytes) return '—';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Store/retrieve Drive folder config for batches
const DRIVE_CONFIG_KEY = 'aust-drive-folders';

export function getDriveFolderConfig() {
  try {
    const stored = localStorage.getItem(DRIVE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveDriveFolderConfig(config) {
  try {
    localStorage.setItem(DRIVE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Drive config:', e);
  }
}

// Get folder URL for a specific course/batch
export function getCourseFolderUrl(course, department, yearSem) {
  const config = getDriveFolderConfig();
  const key = `${course}-${department}-${yearSem}`;
  return config[key] || null;
}

// Save folder URL for a specific course/batch
export function saveCourseFolderUrl(course, department, yearSem, folderUrl) {
  const config = getDriveFolderConfig();
  const key = `${course}-${department}-${yearSem}`;
  config[key] = folderUrl;
  saveDriveFolderConfig(config);
}
