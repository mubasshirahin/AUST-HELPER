import { Flame, FileBadge, Sparkles } from 'lucide-react';
import './RoastCVPage.css';

export default function RoastCVPage() {
  return (
    <div className="roastcv-page animate-fadeIn">
      <header className="roastcv-hero">
        <div className="roastcv-hero-bg" aria-hidden="true">
          <div className="roastcv-hero-grid" />
          <div className="roastcv-hero-orb roastcv-hero-orb-1" />
          <div className="roastcv-hero-orb roastcv-hero-orb-2" />
          <div className="roastcv-hero-shimmer" />
        </div>
        <div className="roastcv-hero-content">
          <div className="roastcv-hero-title-row">
            <div className="roastcv-hero-icon">
              <Flame size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="roastcv-hero-title">
                <span className="roastcv-hero-name">Roast CV</span>
              </h1>
              <p className="roastcv-hero-subtitle">
                Upload your CV and get brutally honest, AI-powered feedback to land your dream job.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="roastcv-coming-soon">
        <div className="roastcv-cs-card">
          <FileBadge size={32} strokeWidth={1.5} />
          <h2>CV Roaster — Coming Soon</h2>
          <p>Our AI will analyze your CV for formatting, ATS compatibility, keyword optimization, and overall impact. Get actionable roast feedback that actually helps.</p>
          <div className="roastcv-feature-pills">
            <span><Sparkles size={14} /> AI-Powered Analysis</span>
            <span><FileBadge size={14} /> ATS Score Check</span>
            <span><Flame size={14} /> Brutal Honesty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
