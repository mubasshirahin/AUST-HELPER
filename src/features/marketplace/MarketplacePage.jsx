import { useState } from 'react';
import ExchangeKits from './ExchangeKits';
import ToLetListings from './ToLetListings';
import LostAndFound from './LostAndFound';
import PartnerMatcher from './PartnerMatcher';
import MentorFinder from './MentorFinder';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('exchange');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'exchange':
        return <ExchangeKits />;
      case 'tolet':
        return <ToLetListings />;
      case 'lost':
        return <LostAndFound />;
      case 'partner':
        return <PartnerMatcher />;
      case 'mentor':
        return <MentorFinder />;
      default:
        return <ExchangeKits />;
    }
  };

  return (
    <div className="marketplace-page animate-fadeIn">
      <div className="marketplace-header">
        <h1 className="page-title">Campus Market</h1>
        <p className="page-description">
          Trade student equipment/books, find bachelor sharing hosts, locate lost products, and connect study buddies.
        </p>
      </div>

      <div className="tabs marketplace-tabs">
        <button type="button" className={`tab ${activeTab === 'exchange' ? 'active' : ''}`} onClick={() => setActiveTab('exchange')}>Exchange Kits</button>
        <button type="button" className={`tab ${activeTab === 'tolet' ? 'active' : ''}`} onClick={() => setActiveTab('tolet')}>AUST To-Let</button>
        <button type="button" className={`tab ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>Lost & Found</button>
        <button type="button" className={`tab ${activeTab === 'partner' ? 'active' : ''}`} onClick={() => setActiveTab('partner')}>Study Partner Matcher</button>
        <button type="button" className={`tab ${activeTab === 'mentor' ? 'active' : ''}`} onClick={() => setActiveTab('mentor')}>Find Mentors</button>
      </div>

      <div className="marketplace-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
