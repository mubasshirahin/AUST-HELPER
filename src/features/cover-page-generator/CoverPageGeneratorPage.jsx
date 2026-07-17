import { NotebookPen, FileText, Printer } from 'lucide-react';
import './CoverPageGeneratorPage.css';

export default function CoverPageGeneratorPage() {
  return (
    <div className="cpgen-page animate-fadeIn">
      <header className="cpgen-hero">
        <div className="cpgen-hero-bg" aria-hidden="true">
          <div className="cpgen-hero-grid" />
          <div className="cpgen-hero-orb cpgen-hero-orb-1" />
          <div className="cpgen-hero-orb cpgen-hero-orb-2" />
          <div className="cpgen-hero-shimmer" />
        </div>
        <div className="cpgen-hero-content">
          <div className="cpgen-hero-title-row">
            <div className="cpgen-hero-icon">
              <NotebookPen size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="cpgen-hero-title">
                <span className="cpgen-hero-name">Cover Page Generator</span>
              </h1>
              <p className="cpgen-hero-subtitle">
                Generate professional assignment and lab report cover pages in seconds.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="cpgen-coming-soon">
        <div className="cpgen-cs-card">
          <FileText size={32} strokeWidth={1.5} />
          <h2>Cover Page Generator — Coming Soon</h2>
          <p>Select your department, course code, batch, and section — we'll generate a beautifully formatted cover page ready for print.</p>
          <div className="cpgen-feature-pills">
            <span><NotebookPen size={14} /> Assignment Covers</span>
            <span><Printer size={14} /> Print-Ready PDF</span>
            <span><FileText size={14} /> Lab Report Covers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
