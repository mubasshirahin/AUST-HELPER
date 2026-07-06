import React from 'react';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="about-us-container animate-fadeIn">
      <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', marginBottom: '8px' }}>About AUSTWise</h3>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        An all-in-one academic command center custom-tailored for Ahsanullah University of Science & Technology (AUST).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Goals card */}
        <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} /> Project Vision
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
            To simplify the daily academic hustle of AUST students by unifying schedules, exam plans, materials, to-let boards, and social squares under one beautifully-crafted interface.
          </p>
        </div>

        {/* Development specifications */}
        <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Cpu size={16} style={{ color: 'var(--accent-purple)' }} /> Technical Specifications
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span>Core Framework: <b>React 18 (Vite JS Scaffold)</b></span>
            <span>Component Modules: <b>Vanilla CSS custom parameters</b></span>
            <span>Chart visualizers: <b>Chart.js (React-chartjs-2 integration)</b></span>
            <span>Icon components: <b>Lucide Icons library</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
