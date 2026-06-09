import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, AlertTriangle } from 'lucide-react';
import { seniorSecrets } from '../../data/mockData';

export default function SeniorSecrets() {
  const [secrets, setSecrets] = useState(seniorSecrets);

  const handleUpvote = (id) => {
    setSecrets(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          upvotes: s.upvotes + 1
        };
      }
      return s;
    }));
  };

  return (
    <div className="glass-card-static secrets-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
            <Lightbulb size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Seniors' Secrets</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Insider tips and course hacks for specific labs and teachers</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {secrets.map(secret => {
          const isKiller = secret.type === 'killer';

          return (
            <div 
              key={secret.id}
              className="glass-card"
              style={{
                padding: '20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: isKiller ? '4px solid var(--accent-rose)' : '4px solid var(--accent-blue)',
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>{secret.course}</span>
                  {isKiller && (
                    <span className="badge badge-rose" style={{ fontSize: '9px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                      <AlertTriangle size={10} /> CRITICAL ALERT
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0 10px 0' }}>{secret.title}</h3>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  "{secret.tip}"
                </p>
              </div>

              <div className="flex justify-between items-center mt-6 pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>Shared by: <b>{secret.author}</b></span>
                
                <button 
                  className="flex items-center gap-1 btn btn-secondary btn-sm"
                  onClick={() => handleUpvote(secret.id)}
                  style={{ background: 'var(--bg-secondary)', padding: '4px 8px' }}
                >
                  <ThumbsUp size={12} /> {secret.upvotes} Helpful
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
