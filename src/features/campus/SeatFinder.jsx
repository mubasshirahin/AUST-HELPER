import React, { useState, useMemo } from 'react';
import { Search, Compass, AlertCircle } from 'lucide-react';
import { examSeats, currentUser } from '../../data/mockData';

export default function SeatFinder() {
  const [stuIdInput, setStuIdInput] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!stuIdInput.trim()) return;

    const match = examSeats.find(s => s.studentId.toLowerCase() === stuIdInput.trim().toLowerCase());
    setResult(match || null);
    setSearched(true);
  };

  const handleQuickLoad = () => {
    setStuIdInput(currentUser.id);
    const match = examSeats.find(s => s.studentId === currentUser.id);
    setResult(match || null);
    setSearched(true);
  };

  return (
    <div className="glass-card-static seat-finder-container animate-fadeInUp" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex items-center gap-2 mb-6">
        <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
          <Compass size={18} />
        </div>
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Exam Seat Plan Finder</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Locate exam rooms and benches using your Student ID</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter Student ID (e.g. STU-2021-301-001)..."
            value={stuIdInput}
            onChange={(e) => setStuIdInput(e.target.value)}
            className="input"
            style={{ padding: '12px 16px' }}
          />
          <button type="submit" className="btn btn-primary">Find Seat</button>
        </div>
        <button 
          type="button" 
          onClick={handleQuickLoad}
          style={{ fontSize: '11px', color: 'var(--accent-blue)', marginTop: '8px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          ⚡ Load my student ID ({currentUser.id})
        </button>
      </form>

      {searched && (
        <div className="animate-fadeIn">
          {result ? (
            <div style={{ background: 'var(--accent-blue-glow)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-xl)', padding: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>EXAM LOCATION FOUND</span>
              
              <div className="grid-2 mt-4" style={{ gap: '16px' }}>
                <div className="p-3" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Exam Room</span>
                  <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--accent-purple)', marginTop: '4px' }}>{result.room}</p>
                </div>
                <div className="p-3" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Bench Number</span>
                  <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--accent-blue)', marginTop: '4px' }}>{result.bench}</p>
                </div>
              </div>

              <div className="mt-4 p-2.5" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Location Bench Row: <b>{result.row} Row</b>. Please make sure to be inside the room 15 minutes before the exam begins.
              </div>
            </div>
          ) : (
            <div className="flex gap-3 p-4" style={{ background: 'var(--accent-rose-glow)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
              <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Seat Plan Not Published:</span> No matched coordinates for this student ID. Check if the controller office has published files.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
