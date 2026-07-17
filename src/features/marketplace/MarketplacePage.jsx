import { useState } from 'react';
import { ShoppingBag, Home, Search, UserPlus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ExchangeKits from './ExchangeKits';
import ToLetListings from './ToLetListings';
import LostAndFound from './LostAndFound';
import MentorRequests from './MentorRequests';
import GliderTabs from '../../components/GliderTabs';
import MarketplaceMasthead from './MarketplaceMasthead';
import './MarketplacePage.css';

const MARKETPLACE_TAB_KEY = 'aust-marketplace-active-tab';

const marketplaceTabs = [
  { id: 'exchange', label: 'Exchange Kits', icon: ShoppingBag, color: 'amber', desc: 'Trade books & equipment' },
  { id: 'tolet', label: 'AUST To-Let', icon: Home, color: 'purple', desc: 'Bachelor sharing hosts' },
  { id: 'lost', label: 'Lost & Found', icon: Search, color: 'emerald', desc: 'Locate lost products' },
  { id: 'mentorRequests', label: 'Mentor Requests', icon: UserPlus, color: 'blue', desc: 'Connect study buddies' },
];

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
      case 'exchange': return <ExchangeKits />;
      case 'tolet': return <ToLetListings />;
      case 'lost': return <LostAndFound />;
      case 'mentorRequests': return <MentorRequests />;
      default: return <ExchangeKits />;
    }
  };

  return (
    <div className={`marketplace-page animate-fadeIn${isNewsprint ? ' marketplace-newsprint' : ''}`}>
      {isNewsprint ? (
        <MarketplaceMasthead />
      ) : (
        <>
          {/* ─── Dashboard-style Hero Header ─── */}
          <header className="marketplace-hero">
            <div className="marketplace-hero-bg" aria-hidden="true">
              <div className="marketplace-hero-grid" />
              <div className="marketplace-hero-orb marketplace-hero-orb-1" />
              <div className="marketplace-hero-orb marketplace-hero-orb-2" />
            </div>
            <div className="marketplace-hero-content">
              <div className="marketplace-hero-title-row">
                <div className="marketplace-hero-icon">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h1 className="marketplace-hero-title">
                    Campus <span className="marketplace-hero-title-highlight">Market</span>
                  </h1>
                  <p className="marketplace-hero-subtitle">
                    Trade student equipment/books, find bachelor sharing hosts, locate lost products, and connect study buddies.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* ─── GliderTabs ─── */}
          <GliderTabs
            tabs={marketplaceTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
            variant="dashboard"
          />

          {/* ─── Section Header ─── */}
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon" style={{ background: 'var(--accent-amber-glow)', color: 'var(--accent-amber)' }}>
                <ShoppingBag size={16} />
              </span>
              Browse Listings
            </h2>
          </div>
        </>
      )}

      <div className="marketplace-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
