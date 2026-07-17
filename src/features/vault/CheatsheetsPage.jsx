import { BookOpen } from 'lucide-react';
import Cheatsheets from './Cheatsheets';
import './Cheatsheets.css';

export default function CheatsheetsPage() {
  return (
    <div className="csh-page animate-fadeIn">
      {/* ── Hero ── */}
      <header className="csh-hero">
        <div className="csh-hero-bg" aria-hidden="true">
          <div className="csh-hero-grid" />
          <div className="csh-hero-orb csh-hero-orb-1" />
          <div className="csh-hero-orb csh-hero-orb-2" />
          <div className="csh-hero-orb csh-hero-orb-3" />
          <div className="csh-hero-shimmer" />
        </div>
        <div className="csh-hero-content">
          <div className="csh-hero-title-row">
            <div className="csh-hero-icon">
              <BookOpen size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="csh-hero-title">
                <span className="csh-hero-title-accent">Cheatsheets</span>
              </h1>
              <p className="csh-hero-subtitle">
                Quick-reference formula sheets across all departments and topics.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Cheatsheets ── */}
      <Cheatsheets vaultContext={{ course: null, courseName: 'All courses' }} />
    </div>
  );
}
