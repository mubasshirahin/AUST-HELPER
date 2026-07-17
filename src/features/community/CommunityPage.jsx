import React, { useState } from 'react';
import { MessageCircle, Users, Building2, GraduationCap } from 'lucide-react';
import StoryFeed from './StoryFeed';
import AlumniDirectory from './AlumniDirectory';
import ClubPortal from './ClubPortal';
import StudentDirectory from './StudentDirectory';
import GliderTabs from '../../components/GliderTabs';
import './CommunityPage.css';

const COMMUNITY_TAB_KEY = 'aust-community-active-tab';

const communityTabs = [
  { id: 'feed', label: 'Confessions Feed', icon: MessageCircle, color: 'amber', desc: 'Share & discover' },
  { id: 'alumni', label: 'Alumni Directory', icon: GraduationCap, color: 'purple', desc: 'Connect with alumni' },
  { id: 'clubs', label: 'Clubs Hub', icon: Building2, color: 'emerald', desc: 'Join student clubs' },
  { id: 'students', label: 'Student Directory', icon: Users, color: 'blue', desc: 'Find classmates' },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(COMMUNITY_TAB_KEY) || 'feed';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem(COMMUNITY_TAB_KEY, tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed': return <StoryFeed />;
      case 'alumni': return <AlumniDirectory />;
      case 'clubs': return <ClubPortal />;
      case 'students': return <StudentDirectory />;
      default: return <StoryFeed />;
    }
  };

  return (
    <div className="community-page animate-fadeIn">
      <header className="community-hero">
        <div className="community-hero-bg" aria-hidden="true">
          <div className="community-hero-grid" />
        </div>
        <div className="community-hero-content">
          <div className="community-hero-title-row">
            <div className="community-hero-icon">
              <MessageCircle size={24} />
            </div>
            <div>
              <h1 className="community-hero-title">
                <span className="community-hero-title-highlight">Community</span>
              </h1>
              <p className="community-hero-subtitle">
                Share anonymous student confessions, lookup alumni networks, and join active clubs.
              </p>
            </div>
          </div>
        </div>
      </header>


      <GliderTabs
        tabs={communityTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="dashboard"
      />

      {/* ─── Section header for tabs ─── */}
      <div className="section-header">
        <h2 className="section-title">
          <span className="icon" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
            <MessageCircle size={16} />
          </span>
          Explore Community
        </h2>
      </div>

      <div className="community-content-area" key={activeTab}>
        {renderActiveTab()}
      </div>
    </div>
  );
}
