import React, { useState } from 'react';
import { Map, MapPin, Users, Library, UtensilsCrossed } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import FacultyStatus from './FacultyStatus';
import LibraryPulse from './LibraryPulse';
import CanteenMenu from './CanteenMenu';
import GliderTabs from '../../components/GliderTabs';
import './CampusPage.css';

const campusTabs = [
  { id: 'map',     label: 'Floor Finder',     icon: MapPin,          color: 'cyan',    desc: '' },
  { id: 'faculty', label: 'Faculty Status',   icon: Users,           color: 'amber',   desc: 'Office hours' },
  { id: 'library', label: 'Library Pulse',    icon: Library,         color: 'emerald', desc: 'Occupancy' },
  { id: 'canteen', label: 'Canteen Menu',     icon: UtensilsCrossed, color: 'rose',    desc: "Today's menu" },
];

const CAMPUS_TAB_KEY = 'aust-campus-active-tab';

export default function CampusPage() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(CAMPUS_TAB_KEY) || 'map';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem(CAMPUS_TAB_KEY, tab);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map': return <InteractiveMap />;
      case 'faculty': return <FacultyStatus />;
      case 'library': return <LibraryPulse />;
      case 'canteen': return <CanteenMenu />;
      default: return <InteractiveMap />;
    }
  };

  return (
    <div className="campus-page animate-fadeIn">
      <header className="campus-hero">
        <div className="campus-hero-bg" aria-hidden="true">
          <div className="campus-hero-grid" />
        </div>
        <div className="campus-hero-content">
          <div className="campus-hero-title-row">
            <div className="campus-hero-icon">
              <Map size={26} />
            </div>
            <div>
              <h1 className="campus-hero-title">Campus Hub</h1>
              <p className="campus-hero-subtitle">
                Navigate buildings, review faculty office hours, and check live canteen/library occupancy.
              </p>
            </div>
          </div>
        </div>
      </header>

      <GliderTabs
        tabs={campusTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="gradelab"
        compact
      />

      <div className="campus-content-area" key={activeTab}>
        {renderActiveTab()}
      </div>
    </div>
  );
}
