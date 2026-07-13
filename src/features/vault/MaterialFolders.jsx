import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Plus, ExternalLink, Loader2, AlertCircle, RefreshCw, Link, X, Download, Eye, FileText, Image, Film } from 'lucide-react';
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

// Get preview/download URL for Google Drive files
function getDriveFileUrl(fileId, type = 'view') {
  // type: 'view' = preview, 'download' = download, 'direct' = direct link
  if (type === 'download') {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }
  return `https://drive.google.com/file/d/${fileId}/view`;
}

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

// Preview Modal Component
function FilePreviewModal({ file, token, onClose }) {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const category = getFileCategory(file.mimeType);

  useEffect(() => {
    // Get direct download URL with auth
    if (token) {
      setDownloadUrl(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`);
    }
  }, [file.id, token]);

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
          Your browser does not support video playback.
        </video>
      );
    }
    // For other files, show file info
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
      }}>
        <FileIcon mimeType={file.mimeType} size={48} />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px' }}>
          Preview not available for this file type.
        </p>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Download size={16} /> Download to View
        </button>
      </div>
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 500 }}
    >
      <div
        className="modal glass-card-static"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(90vw, 900px)',
          height: 'min(85vh, 700px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <FileIcon mimeType={file.mimeType} />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 'var(--fw-semibold)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.name}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={14} /> Download
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          overflow: 'auto',
          padding: '16px',
        }}>
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
  const [token, setToken] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Load saved folder URL when course changes
  useEffect(() => {
    const savedUrl = getCourseFolderUrl(course, department, yearSem) || '';
    setFolderUrl(savedUrl);
    setIsEditing(!savedUrl);
    setFiles([]);
    setError(null);
    setPreviewFile(null);
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
      if (err.message?.includes('401') || err.message?.includes('token')) {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [folderUrl, token, initGoogleAuth]);

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

  const handleDownload = async (file) => {
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

  const handleFileClick = (file) => {
    const category = getFileCategory(file.mimeType);
    // Open preview modal for viewable files
    if (['pdf', 'image', 'video'].includes(category)) {
      setPreviewFile(file);
    } else {
      // Download other file types directly
      handleDownload(file);
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
          {files.map((file) => {
            const category = getFileCategory(file.mimeType);
            const canPreview = ['pdf', 'image', 'video'].includes(category);

            return (
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
                onClick={() => handleFileClick(file)}
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
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {canPreview && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                      title="Preview"
                      style={{ padding: '4px 8px' }}
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                    title="Download"
                    style={{ padding: '4px 8px' }}
                  >
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

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          token={token}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
