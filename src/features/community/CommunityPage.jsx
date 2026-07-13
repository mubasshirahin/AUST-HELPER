import React, { useState } from 'react';
import StoryFeed from './StoryFeed';
import AlumniDirectory from './AlumniDirectory';
import ClubPortal from './ClubPortal';
import StudentDirectory from './StudentDirectory';
import './CommunityPage.css';

const COMMUNITY_TAB_KEY = 'aust-community-active-tab';

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
      <div className="community-header">
        <h1 className="page-title">Social Square</h1>
        <p className="page-description">Share anonymous student confessions, lookup alumni networks, and join active clubs.</p>
      </div>

      <div className="tabs community-tabs">
        <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => handleTabChange('feed')}>Confessions Feed</button>
        <button className={`tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => handleTabChange('alumni')}>Alumni Directory</button>
        <button className={`tab ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => handleTabChange('clubs')}>Clubs Hub</button>
        <button className={`tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => handleTabChange('students')}>Student Directory</button>
      </div>

      <div className="community-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
