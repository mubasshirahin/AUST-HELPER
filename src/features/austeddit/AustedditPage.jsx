import { Globe, MessageCircle, ThumbsUp, Hash } from 'lucide-react';
import './AustedditPage.css';

export default function AustedditPage() {
  return (
    <div className="aed-page animate-fadeIn">
      <header className="aed-hero">
        <div className="aed-hero-bg" aria-hidden="true">
          <div className="aed-hero-grid" />
          <div className="aed-hero-orb aed-hero-orb-1" />
          <div className="aed-hero-orb aed-hero-orb-2" />
          <div className="aed-hero-shimmer" />
        </div>
        <div className="aed-hero-content">
          <div className="aed-hero-title-row">
            <div className="aed-hero-icon">
              <Globe size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="aed-hero-title">
                <span className="aed-hero-name">Austeddit</span>
              </h1>
              <p className="aed-hero-subtitle">
                The anonymous AUST forum — share, discuss, and vote on anything campus-related.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="aed-coming-soon">
        <div className="aed-cs-card">
          <MessageCircle size={32} strokeWidth={1.5} />
          <h2>Austeddit — Coming Soon</h2>
          <p>A Reddit-style anonymous forum exclusively for AUST students. Post confessions, memes, academic discussions, campus gossip, and more. Upvote, downvote, and comment freely.</p>
          <div className="aed-feature-pills">
            <span><Hash size={14} /> Topic Channels</span>
            <span><ThumbsUp size={14} /> Upvote System</span>
            <span><Globe size={14} /> 100% Anonymous</span>
          </div>
        </div>
      </div>
    </div>
  );
}
