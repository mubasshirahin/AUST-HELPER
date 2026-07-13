import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ExchangeKits from './ExchangeKits';
import ToLetListings from './ToLetListings';
import LostAndFound from './LostAndFound';
import MentorRequests from './MentorRequests';
import MarketplaceMasthead from './MarketplaceMasthead';
import './MarketplacePage.css';

const MARKETPLACE_TAB_KEY = 'aust-marketplace-active-tab';

export default function MarketplacePage() {
  const { theme } = useTheme();
  const isNewsprint = theme === 'newsprint';
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(MARKETPLACE_TAB_KEY) || 'exchange';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem(MARKETPLACE_TAB_KEY, tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'exchange':
        return <ExchangeKits />;
      case 'tolet':
        return <ToLetListings />;
      case 'lost':
        return <LostAndFound />;
      case 'mentorRequests':
        return <MentorRequests />;
      default:
        return <ExchangeKits />;
    }
  };

  return (
    <div className={`marketplace-page animate-fadeIn${isNewsprint ? ' marketplace-newsprint' : ''}`}>
      {isNewsprint ? (
        <MarketplaceMasthead />
      ) : (
        <div className="marketplace-header">
          <h1 className="page-title">Campus Market</h1>
          <p className="page-description">
            Trade student equipment/books, find bachelor sharing hosts, locate lost products, and connect study buddies.
          </p>
        </div>
      )}

      <div className="tabs marketplace-tabs">
        <button type="button" className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => handleTabChange('exchange')}>Exchange Kits</button>
        <button type="button" className={`tab ${activeTab === 'tolet' ? 'active' : ''}`} onClick={() => handleTabChange('tolet')}>AUST To-Let</button>
        <button type="button" className={`tab ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => handleTabChange('lost')}>Lost & Found</button>
        <button type="button" className={`tab ${activeTab === 'mentorRequests' ? 'active' : ''}`} onClick={() => handleTabChange('mentorRequests')}>Mentor Requests</button>
      </div>

      <div className="marketplace-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
