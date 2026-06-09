import React, { useState, useMemo } from 'react';
import { Search, Mail, MapPin, Award } from 'lucide-react';
import { alumniData } from '../../data/mockData';

export default function AlumniDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlumni = useMemo(() => {
    return alumniData.filter(al => 
      al.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      al.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  return (
    <div className="glass-card-static alumni-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Alumni Corner</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Connect with graduates working in global tech and industry roles</p>
        </div>
        
        <div className="search-box" style={{ width: '240px' }}>
          <input 
            type="text" 
            placeholder="Search alumni by skills/firm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        {filteredAlumni.map(al => (
          <div 
            key={al.id}
            className="glass-card"
            style={{
              padding: '16px 20px',
              background: 'var(--bg-input)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px'
            }}
          >
            <div>
              <div className="flex gap-3 items-start mb-3">
                <div className="avatar" style={{ width: '40px', height: '40px' }}>
                  {al.avatar}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{al.name}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>AUST {al.batch} Batch Graduate</p>
                </div>
              </div>

              {/* Company placement */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', margin: '14px 0' }}>
                <span className="flex items-center gap-1.5">Role: <b>{al.role}</b></span>
                <span className="flex items-center gap-1.5">Company: <b>{al.company}</b></span>
                <span className="flex items-center gap-1.5"><MapPin size={12} /> {al.location}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
              <div className="flex gap-1">
                {al.skills.slice(0, 2).map(skill => (
                  <span key={skill} className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px' }}>{skill}</span>
                ))}
              </div>

              <button 
                className="btn btn-primary btn-sm"
                disabled={!al.available}
                onClick={() => alert(`Connecting notification sent to ${al.name}. Ensure your student profile is populated.`)}
                style={{ fontSize: '10px', padding: '4px 10px' }}
              >
                {al.available ? 'Request Mentorship' : 'Busy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
