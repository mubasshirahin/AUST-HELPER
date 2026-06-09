import React, { useState, useMemo } from 'react';
import { UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { facultyData } from '../../data/mockData';

export default function FacultyStatus() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = useMemo(() => {
    return facultyData.filter(fac => 
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const getStatusDotClass = (status) => {
    switch (status) {
      case 'available': return 'online';
      case 'away': return 'away';
      case 'busy': return 'busy';
      case 'in-class': return 'busy';
      default: return 'offline';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available (in office)';
      case 'away': return 'Away (out of campus)';
      case 'busy': return 'Busy (meetings)';
      case 'in-class': return 'In a Class Lecture';
      default: return 'Offline';
    }
  };

  return (
    <div className="glass-card-static faculty-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Faculty Office Hours & Status</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Check active faculty availability indicators and schedule timings</p>
        </div>
        
        <div className="search-box" style={{ width: '240px' }}>
          <input 
            type="text" 
            placeholder="Search faculty by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3">
        {filteredFaculty.map(fac => (
          <div 
            key={fac.id}
            className="glass-card"
            style={{
              padding: '16px 20px',
              background: 'var(--bg-input)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 'var(--fw-bold)' }}>{fac.name}</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{fac.designation} • Dept of {fac.department}</p>
                </div>
                <div className="flex items-center gap-1.5 tooltip-wrapper">
                  <span className={`status-dot ${getStatusDotClass(fac.status)}`}></span>
                  <div className="tooltip">{getStatusText(fac.status)}</div>
                </div>
              </div>

              {/* Core contacts and offices */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', margin: '14px 0' }}>
                <span className="flex items-center gap-2">Room: <b>Office {fac.room}</b></span>
                <span className="flex items-center gap-2"><Mail size={12} /> {fac.email}</span>
                <span className="flex items-center gap-2"><Calendar size={12} /> Hours: <b>{fac.officeHours}</b></span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-4 pt-2" style={{ borderTop: '1px solid var(--border-secondary)' }}>
              {fac.expertise.map(exp => (
                <span key={exp} className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px' }}>{exp}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
