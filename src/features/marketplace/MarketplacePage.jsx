import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ExchangeKits from './ExchangeKits';
import ToLetListings from './ToLetListings';
import LostAndFound from './LostAndFound';
import MentorRequests from './MentorRequests';
import MarketplaceMasthead from './MarketplaceMasthead';
import MarketplaceMaxHero from './MarketplaceMaxHero';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const { theme } = useTheme();
  const isNewsprint = theme === 'newsprint';
  const isMax = theme === 'maximalism';
  const [activeTab, setActiveTab] = useState('exchange');

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
    <div className={`marketplace-page animate-fadeIn${isNewsprint ? ' marketplace-newsprint' : ''}${isMax ? ' marketplace-maximalism' : ''}`}>
      {isNewsprint ? (
        <MarketplaceMasthead />
      ) : isMax ? (
        <MarketplaceMaxHero />
      ) : (
        <div className="marketplace-header">
          <h1 className="page-title">Campus Market</h1>
          <p className="page-description">
            Trade student equipment/books, find bachelor sharing hosts, locate lost products, and connect study buddies.
          </p>
        </div>
      )}

      <div className="tabs marketplace-tabs">
        <button type="button" className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>Exchange Kits</button>
        <button type="button" className={`tab ${activeTab === 'tolet' ? 'active' : ''}`} onClick={() => setActiveTab('tolet')}>AUST To-Let</button>
        <button type="button" className={`tab ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>Lost & Found</button>
        <button type="button" className={`tab ${activeTab === 'mentorRequests' ? 'active' : ''}`} onClick={() => setActiveTab('mentorRequests')}>Mentor Requests</button>
      </div>

      <div className="marketplace-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
