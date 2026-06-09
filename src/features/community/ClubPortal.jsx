import React, { useState } from 'react';
import { Target, PlusCircle, CheckCircle } from 'lucide-react';
import { clubsData } from '../../data/mockData';

export default function ClubPortal() {
  const [clubs, setClubs] = useState(clubsData);

  const handleJoinToggle = (clubId) => {
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return {
          ...c,
          joined: !c.joined,
          members: c.joined ? c.members - 1 : c.members + 1
        };
      }
      return c;
    }));
  };

  return (
    <div className="glass-card-static clubs-portal-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)', padding: '6px', borderRadius: '8px' }}>
            <Target size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>University Clubs & Portals</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Explore and sign up for active campus student clubs</p>
          </div>
        </div>
      </div>

      <div className="grid-3">
        {clubs.map(club => (
          <div 
            key={club.id}
            className="glass-card"
            style={{
              padding: '16px 20px',
              background: 'var(--bg-input)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              borderTop: `4px solid ${club.color}`
            }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="badge badge-blue" style={{ fontSize: '9px' }}>{club.category}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{club.members} Members</span>
              </div>
              
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0' }}>{club.name}</h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '8px 0' }}>
                {club.description}
              </p>
              
              <div style={{ fontSize: '10px', color: 'var(--accent-orange)', marginTop: '10px' }}>
                Next Event: <b>{club.nextEvent}</b>
              </div>
            </div>

            <button 
              className={`btn btn-sm mt-6 ${club.joined ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => handleJoinToggle(club.id)}
              style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}
            >
              {club.joined ? (
                <>
                  <CheckCircle size={12} /> Joined Club
                </>
              ) : (
                <>
                  <PlusCircle size={12} /> Join Club
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
