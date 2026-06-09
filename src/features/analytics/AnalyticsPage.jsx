import React, { useState } from 'react';
import CGPAGraph from './CGPAGraph';
import SemesterTracker from './SemesterTracker';
import TargetCalculator from './TargetCalculator';
import DeptHeatmap from './DeptHeatmap';
import SyllabusProgress from './SyllabusProgress';
import CourseReview from './CourseReview';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('cgpagraph');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cgpagraph': return <CGPAGraph />;
      case 'semestertracker': return <SemesterTracker />;
      case 'target': return <TargetCalculator />;
      case 'heatmap': return <DeptHeatmap />;
      case 'syllabus': return <SyllabusProgress />;
      case 'reviews': return <CourseReview />;
      default: return <CGPAGraph />;
    }
  };

  return (
    <div className="analytics-page animate-fadeIn">
      <div className="analytics-header">
        <h1 className="page-title">Grade Lab</h1>
        <p className="page-description">Track historical grades, simulate what-if scenarios, and view syllabus completion.</p>
      </div>

      <div className="tabs analytics-tabs">
        <button className={`tab ${activeTab === 'cgpagraph' ? 'active' : ''}`} onClick={() => setActiveTab('cgpagraph')}>CGPA Tracker</button>
        <button className={`tab ${activeTab === 'semestertracker' ? 'active' : ''}`} onClick={() => setActiveTab('semestertracker')}>Semester Tracker</button>
        <button className={`tab ${activeTab === 'target' ? 'active' : ''}`} onClick={() => setActiveTab('target')}>GPA Target Sim</button>
        <button className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>Dept Heatmap</button>
        <button className={`tab ${activeTab === 'syllabus' ? 'active' : ''}`} onClick={() => setActiveTab('syllabus')}>Syllabus Progress</button>
        <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Course Reviews</button>
      </div>

      <div className="analytics-content-area">
        {renderActiveTab()}
      </div>
    </div>
  );
}
