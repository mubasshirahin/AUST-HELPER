import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Plus, Loader2, AlertCircle, RefreshCw, Link, X, Download, Eye } from 'lucide-react';
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

// File Preview Modal
function FilePreviewModal({ file, token, onClose }) {
  const category = getFileCategory(file.mimeType);

  const handleDownload = async () => {
    if (!token) return;
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const renderPreview = () => {
    if (category === 'pdf') {
      return (
        <iframe
          src={`https://drive.google.com/file/d/${file.id}/preview`}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)' }}
          title={file.name}
        />
      );
    }
    if (category === 'image') {
      return (
        <img
          src={`https://drive.google.com/uc?id=${file.id}`}
          alt={file.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
        />
      );
    }
    if (category === 'video') {
      return (
        <video
          controls
          style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-md)' }}
        >
          <source src={`https://drive.google.com/uc?id=${file.id}`} type={file.mimeType} />
        </video>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <FileIcon mimeType={file.mimeType} size={48} />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Preview not available</p>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={16} /> Download to View
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 500 }}>
      <div
        className="modal glass-card-static"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(90vw, 900px)', height: 'min(85vh, 700px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <FileIcon mimeType={file.mimeType} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 'var(--fw-semibold)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}><Download size={14} /> Download</button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', overflow: 'auto', padding: '16px' }}>
          {renderPreview()}
        </div>
      </div>
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
  const [token, setToken] = useState(() => localStorage.getItem('google_drive_token') || null);
  const [tokenExpiry, setTokenExpiry] = useState(() => {
    const expiry = localStorage.getItem('google_drive_token_expiry');
    return expiry ? parseInt(expiry) : 0;
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Check if token is valid
  const isTokenValid = () => {
    return token && Date.now() < tokenExpiry;
  };

  // Load saved folder URL when course changes
  useEffect(() => {
    const savedUrl = getCourseFolderUrl(course, department, yearSem) || '';
    setFolderUrl(savedUrl);
    setIsEditing(!savedUrl);
    setFiles([]);
    setError(null);
    setPreviewFile(null);
  }, [course, department, yearSem]);

  // Load Google Identity Services script
  const loadGIS = () => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      await loadGIS();

      const accessToken = await new Promise((resolve, reject) => {
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
          error_callback: (err) => {
            reject(new Error(err.type || 'Auth failed'));
          },
        });
        client.requestAccessToken();
      });

      // Save token (expires in ~1 hour)
      setToken(accessToken);
      setTokenExpiry(Date.now() + 3600 * 1000);
      localStorage.setItem('google_drive_token', accessToken);
      localStorage.setItem('google_drive_token_expiry', String(Date.now() + 3600 * 1000));
    } catch (err) {
      console.error('Google auth failed:', err);
      setError('Google sign-in failed. Please try again.');
      setToken(null);
      localStorage.removeItem('google_drive_token');
      localStorage.removeItem('google_drive_token_expiry');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const signOut = () => {
    setToken(null);
    setTokenExpiry(0);
    setFiles([]);
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
  };

  // Fetch files from Drive folder
  const fetchFiles = async () => {
    const folderId = extractFolderId(folderUrl);
    if (!folderId) {
      setError('Invalid folder URL. Please paste a valid Google Drive folder link.');
      return;
    }

    if (!isTokenValid()) {
      setError('Please sign in with Google first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const folderFiles = await fetchDriveFolderFiles(folderId, token);
      setFiles(folderFiles);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to fetch Drive files:', err);
      if (err.message?.includes('401') || err.message?.includes('token')) {
        setError('Session expired. Please sign in again.');
        signOut();
      } else {
        setError(err.message || 'Failed to load files');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when ready
  useEffect(() => {
    if (folderUrl && !isEditing && isTokenValid() && course) {
      fetchFiles();
    }
  }, [folderUrl, isEditing, course, token]);

  const handleSaveUrl = () => {
    if (folderUrl.trim()) {
      saveCourseFolderUrl(course, department, yearSem, folderUrl.trim());
      setIsEditing(false);
      if (isTokenValid()) {
        fetchFiles();
      }
    }
  };

  const handleRemoveUrl = () => {
    setFolderUrl('');
    setFiles([]);
    setIsEditing(true);
    saveCourseFolderUrl(course, department, yearSem, '');
  };

  const handleDownload = async (file) => {
    if (!isTokenValid()) return;
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleFileClick = (file) => {
    const category = getFileCategory(file.mimeType);
    if (['pdf', 'image', 'video'].includes(category)) {
      setPreviewFile(file);
    } else {
      handleDownload(file);
    }
  };

  // Not signed in state
  if (!isTokenValid()) {
    return (
      <div className="glass-card-static materials-container animate-fadeInUp">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Lecture Notes</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{courseName} — Google Drive materials</p>
          </div>
        </div>

        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px',
          }}>
            🔗
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 'var(--fw-bold)', margin: '0 0 8px' }}>Connect Google Drive</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', maxWidth: '400px', marginInline: 'auto' }}>
            Sign in with Google to access your batch's study materials, lecture notes, and resources.
          </p>
          <button
            className="btn btn-primary"
            onClick={signInWithGoogle}
            disabled={authLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            {authLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Connecting...</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {error && (
            <div style={{ marginTop: '16px', padding: '10px 16px', background: 'var(--accent-rose-glow)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--accent-rose) 30%, transparent)', fontSize: '12px', color: 'var(--accent-rose)' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-static materials-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Lecture Notes</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{courseName} — Google Drive materials</p>
        </div>
        <div className="flex items-center gap-2">
          {folderUrl && !isEditing && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={fetchFiles} disabled={loading} title="Refresh">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)} title="Change folder">
                <Link size={14} />
              </button>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={signOut} title="Sign out">
            Sign Out
          </button>
        </div>
      </div>

      {/* Folder URL Input */}
      {isEditing && (
        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', marginBottom: '16px' }}>
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
            <button className="btn btn-primary btn-sm" onClick={handleSaveUrl} disabled={!folderUrl.trim()}>
              Connect
            </button>
            {folderUrl && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFolderUrl(''); setIsEditing(false); }}>
                <X size={14} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            Right-click folder in Drive → "Get link" → Paste here
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--accent-rose-glow)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--accent-rose) 30%, transparent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-rose)' }}>
          <AlertCircle size={16} />
          <span style={{ flex: 1 }}>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '48px 16px', textAlign: 'center' }}>
          <Loader2 size={24} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading files...</p>
        </div>
      )}

      {/* Files List */}
      {!loading && !error && files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map((file) => {
            const category = getFileCategory(file.mimeType);
            const canPreview = ['pdf', 'image', 'video'].includes(category);

            return (
              <div
                key={file.id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleFileClick(file)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; }}
              >
                <FileIcon mimeType={file.mimeType} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 'var(--fw-medium)', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                    {formatFileSize(file.size)}{file.modifiedTime && ` · ${new Date(file.modifiedTime).toLocaleDateString()}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {canPreview && (
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} title="Preview" style={{ padding: '4px 8px' }}>
                      <Eye size={14} />
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDownload(file); }} title="Download" style={{ padding: '4px 8px' }}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && folderUrl && files.length === 0 && !isEditing && (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Folder size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>No files found</p>
          <button className="btn btn-secondary btn-sm" onClick={handleRemoveUrl} style={{ marginTop: '12px' }}>Change Folder</button>
        </div>
      )}

      {/* No Folder */}
      {!loading && !error && !folderUrl && !isEditing && (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Link size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Connect a Drive folder for {courseName}</p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)} style={{ marginTop: '12px' }}><Plus size={14} /> Add Folder</button>
        </div>
      )}

      {previewFile && <FilePreviewModal file={previewFile} token={token} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
