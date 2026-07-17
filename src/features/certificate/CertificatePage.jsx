import { Award, BadgeCheck, Download } from 'lucide-react';
import './CertificatePage.css';

export default function CertificatePage() {
  return (
    <div className="cert-page animate-fadeIn">
      <header className="cert-hero">
        <div className="cert-hero-bg" aria-hidden="true">
          <div className="cert-hero-grid" />
          <div className="cert-hero-orb cert-hero-orb-1" />
          <div className="cert-hero-orb cert-hero-orb-2" />
          <div className="cert-hero-shimmer" />
        </div>
        <div className="cert-hero-content">
          <div className="cert-hero-title-row">
            <div className="cert-hero-icon">
              <Award size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="cert-hero-title">
                <span className="cert-hero-name">Certificate</span>
              </h1>
              <p className="cert-hero-subtitle">
                Generate, manage, and download your academic and extracurricular certificates.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="cert-coming-soon">
        <div className="cert-cs-card">
          <BadgeCheck size={32} strokeWidth={1.5} />
          <h2>Certificate Hub — Coming Soon</h2>
          <p>Design and generate professional certificates for workshops, competitions, club events, and academic achievements. Download as high-quality PDF.</p>
          <div className="cert-feature-pills">
            <span><Award size={14} /> Certificate Generator</span>
            <span><BadgeCheck size={14} /> Verified Badges</span>
            <span><Download size={14} /> PDF Download</span>
          </div>
        </div>
      </div>
    </div>
  );
}
