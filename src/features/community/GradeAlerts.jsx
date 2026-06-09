import React from 'react';
import { ShieldAlert, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { seniorSecrets } from '../../data/mockData';

export default function GradeAlerts() {
  const warnings = seniorSecrets.filter(s => s.type === 'killer');
  const boosters = seniorSecrets.filter(s => s.type === 'booster');

  return (
    <div className="glass-card-static grade-alerts-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-rose-glow)', color: 'var(--accent-rose)', padding: '6px', borderRadius: '8px' }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Grade Booster / Killer Alerts</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Community-voted risk factors for courses this term</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Killers Section */}
        <div className="glass-card-static" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-rose)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertTriangle size={18} /> High Failure Risk Courses
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {warnings.map(item => (
              <div 
                key={item.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: '4px solid var(--accent-rose)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="badge badge-rose" style={{ fontSize: '9px' }}>{item.course}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{item.upvotes} votes</span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Boosters Section */}
        <div className="glass-card-static" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--accent-emerald)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Award size={18} /> High Grade Scoring Boosters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {boosters.slice(0, 2).map(item => (
              <div 
                key={item.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: '4px solid var(--accent-emerald)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="badge badge-emerald" style={{ fontSize: '9px' }}>{item.course}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{item.upvotes} votes</span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
