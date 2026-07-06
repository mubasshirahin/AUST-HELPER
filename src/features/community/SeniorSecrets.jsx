import React, { useState } from 'react';
import { Lightbulb, ThumbsUp, AlertTriangle, Lock, Shield, ChevronRight } from 'lucide-react';
import { seniorSecrets } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SeniorSecrets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState(seniorSecrets);

  const isSenior = user?.role === 'sr' || user?.role === 'admin';

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

  // Locked state for non-Senior users
  if (!isSenior) {
    return (
      <div className="glass-card-static animate-fadeInUp" style={{ textAlign: 'center', padding: '60px 30px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--accent-rose-glow, rgba(239,68,68,0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Lock size={36} style={{ color: 'var(--accent-rose, #ef4444)' }} />
        </div>

        <h2 style={{ fontSize: 'var(--fs-xl, 22px)', fontWeight: 700, marginBottom: 8 }}>
          🔒 Gate Restricted
        </h2>
        <p style={{
          fontSize: 'var(--fs-sm, 14px)',
          color: 'var(--text-secondary)',
          maxWidth: 420,
          margin: '0 auto 24px',
          lineHeight: 1.6,
        }}>
          Only <strong>Student Representatives (SR)</strong> can access Seniors' Secrets —
          insider tips, course hacks, and teacher insights shared by seniors.
          You need the <strong>Senior (SR)</strong> role to enter this section.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Shield size={16} />
            Apply for SR Role
            <ChevronRight size={16} />
          </button>

          <p style={{ fontSize: 'var(--fs-xs, 12px)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            Go to Settings → Role Application to apply for the Student Representative (SR) position.
            Your application will be reviewed by the admin.
          </p>
        </div>
      </div>
    );
  }

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
