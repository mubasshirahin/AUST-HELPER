import React, { useState } from 'react';
import { Video, Play, CheckCircle } from 'lucide-react';
import { playlists } from '../../data/mockData';

export default function PlaylistPlayer() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0]);

  return (
    <div className="glass-card-static playlists-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Course-Based YouTube Playlists</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Curated lecture videos and references for academic terms</p>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        
        {/* Left Side: Playlist selector cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map(pl => {
            const isSelected = selectedPlaylist?.id === pl.id;

            return (
              <div 
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                style={{
                  background: isSelected ? 'var(--accent-blue-glow)' : 'var(--bg-input)',
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all var(--transition-base)'
                }}
              >
                <div style={{ fontSize: '24px', background: 'var(--bg-secondary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pl.thumbnail}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="badge badge-blue" style={{ fontSize: '9px', marginBottom: '4px' }}>{pl.course}</span>
                  <h4 style={{ fontSize: '13px', fontWeight: 'var(--fw-bold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pl.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pl.channel} • {pl.videos} clips</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Simulated video player area */}
        <div 
          className="glass-card-static" 
          style={{ 
            background: '#000', 
            borderRadius: 'var(--radius-xl)', 
            minHeight: '280px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {selectedPlaylist ? (
            <div style={{ textAlign: 'center', color: '#fff', zIndex: 2, padding: '24px' }}>
              <Video size={64} style={{ color: '#ff0000', margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold' }}>{selectedPlaylist.title}</h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Curated content by {selectedPlaylist.channel}</p>
              
              <button 
                className="btn btn-primary mt-6"
                onClick={() => alert(`Launching YouTube video embed playlist: ${selectedPlaylist.title}`)}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <Play size={16} fill="currentColor" /> Play Playlist
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Video size={48} />
              <p>Select a playlist from the left panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
