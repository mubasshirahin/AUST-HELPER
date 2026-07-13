import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Plus, ExternalLink, Loader2, AlertCircle, RefreshCw, Link, X, File, Download } from 'lucide-react';
import { normalizeAccentColor } from '../../utils/colorPalette';
import {
  extractFolderId,
  fetchDriveFolderFiles,
  getFileCategory,
  getFileIcon,
  formatFileSize,
  getCourseFolderUrl,
  saveCourseFolderUrl,
} from '../../utils/googleDrive';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

function FileIcon({ mimeType, size = 18 }) {
  const category = getFileCategory(mimeType);
  const colors = {
    pdf: 'var(--accent-rose)',
    image: 'var(--accent-purple)',
    video: 'var(--accent-amber)',
    spreadsheet: 'var(--accent-emerald)',
    document: 'var(--accent-blue)',
    presentation: 'var(--accent-orange)',
    folder: 'var(--accent-blue)',
    archive: 'var(--text-tertiary)',
    other: 'var(--text-tertiary)',
  };

  return (
    <div style={{
      width: size + 12,
      height: size + 12,
      borderRadius: 'var(--radius-sm)',
      background: `${colors[category]}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size - 2,
      flexShrink: 0,
    }}>
      {getFileIcon(mimeType)}
    </div>
  );
}

export default function MaterialFolders({ vaultContext }) {
  const { course, courseName, department, yearSem } = vaultContext;

  const [folderUrl, setFolderUrl] = useState(() => getCourseFolderUrl(course, department, yearSem) || '');
  const [isEditing, setIsEditing] = useState(!folderUrl);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Load saved folder URL when course changes
  useEffect(() => {
    const savedUrl = getCourseFolderUrl(course, department, yearSem) || '';
    setFolderUrl(savedUrl);
    setIsEditing(!savedUrl);
    setFiles([]);
    setError(null);
  }, [course, department, yearSem]);

  // Initialize Google OAuth for Drive access
  const initGoogleAuth = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: DRIVE_SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.access_token);
            }
          },
        });
        client.requestAccessToken();
      } else {
        // Load GIS script first
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: DRIVE_SCOPES,
            callback: (response) => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(response.access_token);
              }
            },
          });
          client.requestAccessToken();
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      }
    });
  }, []);

  // Fetch files from Drive folder
  const fetchFiles = useCallback(async () => {
    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      setError('Invalid folder URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get or request access token
      let accessToken = token;
      if (!accessToken) {
        accessToken = await initGoogleAuth();
        setToken(accessToken);
      }

      const folderFiles = await fetchDriveFolderFiles(folderId, accessToken);
      setFiles(folderFiles);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to fetch Drive files:', err);
      setError(err.message || 'Failed to load files from Google Drive');
      // Reset token on auth errors
      if (err.message?.includes('401') || err.message?.includes('token')) {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [folderUrl, token, initGoogleAuth]);

  // Auto-fetch when folder URL is set and not editing
  useEffect(() => {
    if (folderUrl && !isEditing && course) {
      fetchFiles();
    }
  }, [folderUrl, isEditing, course]);

  const handleSaveUrl = () => {
    if (folderUrl.trim()) {
      saveCourseFolderUrl(course, department, yearSem, folderUrl.trim());
      setIsEditing(false);
      fetchFiles();
    }
  };

  const handleRemoveUrl = () => {
    setFolderUrl('');
    setFiles([]);
    setIsEditing(true);
    saveCourseFolderUrl(course, department, yearSem, '');
  };

  const handleOpenDrive = () => {
    const folderId = extractFolderId(folderUrl);
    if (folderId) {
      window.open(`https://drive.google.com/drive/folders/${folderId}`, '_blank');
    }
  };

  return (
    <div className="glass-card-static materials-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Lecture Notes</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — Google Drive materials
          </p>
        </div>
        <div className="flex items-center gap-2">
          {folderUrl && !isEditing && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={handleOpenDrive} title="Open in Drive">
                <ExternalLink size={14} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={fetchFiles} disabled={loading} title="Refresh">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)} title="Change folder">
                <Link size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Folder URL Input */}
      {isEditing && (
        <div style={{
          padding: '16px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-primary)',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Paste your Google Drive folder link:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="input"
              style={{ flex: 1, fontSize: '12px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSaveUrl}
              disabled={!folderUrl.trim()}
            >
              Connect
            </button>
            {folderUrl && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFolderUrl(''); setIsEditing(false); }}>
                <X size={14} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            Right-click any folder in Google Drive → "Get link" → Paste here
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--accent-rose-glow)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid color-mix(in srgb, var(--accent-rose) 30%, transparent)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--accent-rose)',
        }}>
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading files from Drive...</p>
        </div>
      )}

      {/* Files List */}
      {!loading && !error && files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => file.webViewLink && window.open(file.webViewLink, '_blank')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-focus)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-input)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              <FileIcon mimeType={file.mimeType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 'var(--fw-medium)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  {formatFileSize(file.size)}
                  {file.modifiedTime && ` · ${new Date(file.modifiedTime).toLocaleDateString()}`}
                </p>
              </div>
              <ExternalLink size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && folderUrl && files.length === 0 && !isEditing && (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Folder size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            No files found in this folder
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleRemoveUrl} style={{ marginTop: '12px' }}>
            Change Folder
          </button>
        </div>
      )}

      {/* No Folder Configured */}
      {!loading && !error && !folderUrl && !isEditing && (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Link size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            Connect a Google Drive folder for {courseName}
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)} style={{ marginTop: '12px' }}>
            <Plus size={14} /> Add Folder Link
          </button>
        </div>
      )}
    </div>
  );
}
