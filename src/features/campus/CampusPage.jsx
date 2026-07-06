import React, { useState } from 'react';
import { Map, Sparkles, MapPin, Users, Library, UtensilsCrossed, GitBranch } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import FacultyStatus from './FacultyStatus';
import LibraryPulse from './LibraryPulse';
import CanteenMenu from './CanteenMenu';
import PrerequisiteTree from './PrerequisiteTree';
import GliderTabs from '../../components/GliderTabs';
import './CampusPage.css';

const campusTabs = [
  { id: 'map',     label: 'Floor Finder',     icon: MapPin,          color: 'cyan',    desc: '' },
  { id: 'faculty', label: 'Faculty Status',   icon: Users,           color: 'amber',   desc: 'Office hours' },
  { id: 'library', label: 'Library Pulse',    icon: Library,         color: 'emerald', desc: 'Occupancy' },
  { id: 'canteen', label: 'Canteen Menu',     icon: UtensilsCrossed, color: 'rose',    desc: "Today's menu" },
  { id: 'prereqs', label: 'Prerequisites',    icon: GitBranch,       color: 'purple',  desc: 'Course tree' },
];

export default function CampusPage() {
  const [activeTab, setActiveTab] = useState('map');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map': return <InteractiveMap />;
      case 'faculty': return <FacultyStatus />;
      case 'library': return <LibraryPulse />;
      case 'canteen': return <CanteenMenu />;
      case 'prereqs': return <PrerequisiteTree />;
      default: return <InteractiveMap />;
    }
  };

  return (
    <div className="campus-page animate-fadeIn">
      <header className="campus-hero">
        <div className="campus-hero-bg" aria-hidden="true">
          <div className="campus-hero-orb campus-hero-orb-1" />
          <div className="campus-hero-orb campus-hero-orb-2" />
          <div className="campus-hero-grid" />
        </div>
        <div className="campus-hero-content">
          <div className="campus-hero-badge">
            <Sparkles size={12} />
            <span>AUST Campus</span>
          </div>
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
        onChange={setActiveTab}
        variant="gradelab"
        compact
      />

      <div className="campus-content-area" key={activeTab}>
        {renderActiveTab()}
      </div>
    </div>
  );
}
