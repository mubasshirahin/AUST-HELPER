import { useState } from 'react';
import { Sparkles, Mail, GitBranch, Globe, ImageIcon, Code } from 'lucide-react';

const AVATAR_KEY = 'austwise_dev_avatar';

export default function AboutUs() {
  const [devAvatar, setDevAvatar] = useState(() => localStorage.getItem(AVATAR_KEY));

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        localStorage.setItem(AVATAR_KEY, dataUrl);
        setDevAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          background: 'var(--accent-blue-glow)',
          border: '1px solid color-mix(in srgb, var(--accent-blue) 25%, transparent)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold', margin: 0 }}>AUSTWise</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              An all-in-one academic command center for Ahsanullah University of Science &amp; Technology (AUST).
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center', margin: '0 0 8px' }}>
          <Code size={16} style={{ color: 'var(--accent-purple)' }} /> Technical Specifications
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>Core: <b>React 18 (Vite JS Scaffold)</b></span>
          <span>Styling: <b>Vanilla CSS with custom properties</b></span>
          <span>Charts: <b>Chart.js (react-chartjs-2)</b></span>
          <span>Icons: <b>Lucide Icons</b></span>
          <span>Storage: <b>Client-side (localStorage)</b></span>
        </div>
      </div>

      <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center', margin: '0 0 12px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} /> Developer
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 84, height: 84, borderRadius: '50%',
              background: devAvatar ? 'none' : 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: 'var(--fs-sm)', flexShrink: 0,
              overflow: 'hidden', position: 'relative', cursor: 'pointer',
            }}
            onClick={() => document.getElementById('dev-avatar-input')?.click()}
            title="Click to upload photo"
          >
            {devAvatar ? (
              <img src={devAvatar} alt="Developer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ImageIcon size={16} />
            )}
            <input
              id="dev-avatar-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-sm)' }}>Mubasshir Mehedi</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
              AUST, CSE
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
              Quanta 52
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <a
            href="mailto:erumthakbe@gmail.com"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--accent-blue)',
              padding: '4px 10px', borderRadius: '6px',
              background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
              textDecoration: 'none',
            }}
          >
            <Mail size={11} /> Email
          </a>
          <a
            href="https://github.com/erumthakbe"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--accent-blue)',
              padding: '4px 10px', borderRadius: '6px',
              background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
              textDecoration: 'none',
            }}
          >
            <GitBranch size={11} /> GitHub
          </a>
          <a
            href="https://facebook.com/erumthakbe"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--accent-blue)',
              padding: '4px 10px', borderRadius: '6px',
              background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
              textDecoration: 'none',
            }}
          >
            <Globe size={11} /> Facebook
          </a>
          <a
            href="https://instagram.com/erumthakbe"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--accent-blue)',
              padding: '4px 10px', borderRadius: '6px',
              background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
              textDecoration: 'none',
            }}
          >
            <Globe size={11} /> Instagram
          </a>
          <a
            href="https://linkedin.com/in/erumthakbe"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', color: 'var(--accent-blue)',
              padding: '4px 10px', borderRadius: '6px',
              background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
              textDecoration: 'none',
            }}
          >
            <Globe size={11} /> LinkedIn
          </a>
        </div>
      </div>

      <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-input)', border: '1px solid var(--border-primary)' }}>
        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'flex', gap: '6px', alignItems: 'center', margin: '0 0 8px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} /> What is AUSTWise?
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          AUSTWise is a solo-built web application designed to simplify academic life at AUST. From CGPA tracking and class schedules to resource sharing and community boards, it brings everything a student needs under one roof. Built entirely by one person.
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        Built with &lt;3 by Mubasshir Mehedi. Not affiliated with AUST.
      </div>
    </div>
  );
}