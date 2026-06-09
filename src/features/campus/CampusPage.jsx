import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';
import SeatFinder from './SeatFinder';
import FacultyStatus from './FacultyStatus';
import LibraryPulse from './LibraryPulse';
import CanteenMenu from './CanteenMenu';
import PrerequisiteTree from './PrerequisiteTree';
import './CampusPage.css';

export default function CampusPage() {
  const [activeTab, setActiveTab] = useState('map');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'map': return <InteractiveMap />;
      case 'seat': return <SeatFinder />;
      case 'faculty': return <FacultyStatus />;
      case 'library': return <LibraryPulse />;
      case 'canteen': return <CanteenMenu />;
      case 'prereqs': return <PrerequisiteTree />;
      default: return <InteractiveMap />;
    }
  };

  return (
    <div className="campus-page animate-fadeIn">
      <div className="campus-header">
        <h1 className="page-title">Campus Hub</h1>
        <p className="page-description">Navigate buildings, locate exam seats, review faculty office hours, and check live canteen/library occupancy.</p>
      </div>

      <div className="tabs campus-tabs">
        <button className={`tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Floor Finder</button>
        <button className={`tab ${activeTab === 'seat' ? 'active' : ''}`} onClick={() => setActiveTab('seat')}>Exam Seat Finder</button>
        <button className={`tab ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>Faculty Status</button>
        <button className={`tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Library Pulse</button>
        <button className={`tab ${activeTab === 'canteen' ? 'active' : ''}`} onClick={() => setActiveTab('canteen')}>Canteen Menu</button>
        <button className={`tab ${activeTab === 'prereqs' ? 'active' : ''}`} onClick={() => setActiveTab('prereqs')}>Prerequisites Tree</button>
      </div>

      <div className="campus-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
