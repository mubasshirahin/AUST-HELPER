import React, { useMemo } from 'react';
import { Folder, Plus } from 'lucide-react';
import { materialFolders } from '../../data/mockData';
import { normalizeAccentColor } from '../../utils/colorPalette';

export default function MaterialFolders({ vaultContext }) {
  const { course, courseName } = vaultContext;

  const folders = useMemo(
    () => materialFolders.filter((folder) => !folder.course || folder.course === course),
    [course],
  );

  return (
    <div className="glass-card-static materials-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Lecture Notes</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — slides, handouts, and study materials
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => alert('Upload dialog simulated. Hook file inputs to personal clouds here.')}
        >
          <Plus size={14} /> Upload Notes
        </button>
      </div>

      {folders.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Folder size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            No lecture notes uploaded for {courseName} yet.
          </p>
        </div>
      ) : (
        <div className="grid-4">
          {folders.map((folder) => {
            const accentColor = normalizeAccentColor(folder.color);

            return (
              <div
                key={folder.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px',
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  transition:
                    'background var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base)',
                }}
                onClick={() => alert(`Opening material cloud folder: ${folder.name}`)}
              >
                <div className="flex justify-between items-start">
                  <span style={{ fontSize: '28px' }}>{folder.icon}</span>
                  <span
                    className="badge"
                    style={{ backgroundColor: accentColor + '15', color: accentColor, fontSize: '10px' }}
                  >
                    {folder.size}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'var(--fw-bold)', margin: '8px 0 2px 0' }}>
                    {folder.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{folder.files} lecture items</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
