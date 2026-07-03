import React, { useState } from 'react';
import {
  TrendingUp, Layers, Grid3x3, BookCheck, Star, Sparkles, FlaskConical,
} from 'lucide-react';
import CGPAGraph from './CGPAGraph';
import SemesterTracker from './SemesterTracker';
import DeptHeatmap from './DeptHeatmap';
import SyllabusProgress from './SyllabusProgress';
import CourseReview from './CourseReview';
import GliderTabs from '../../components/GliderTabs';
import './AnalyticsPage.css';

const gradeLabTabs = [
  { id: 'cgpagraph', label: 'CGPA Tracker', icon: TrendingUp, color: 'blue', desc: 'Grade trends' },
  { id: 'semestertracker', label: 'Semester', icon: Layers, color: 'purple', desc: 'Per-semester' },
  { id: 'heatmap', label: 'Dept Heatmap', icon: Grid3x3, color: 'rose', desc: 'Topic density' },
  { id: 'syllabus', label: 'Syllabus', icon: BookCheck, color: 'emerald', desc: 'Completion' },
  { id: 'reviews', label: 'Reviews', icon: Star, color: 'amber', desc: 'Course ratings' },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('cgpagraph');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cgpagraph': return <CGPAGraph />;
      case 'semestertracker': return <SemesterTracker />;
      case 'heatmap': return <DeptHeatmap />;
      case 'syllabus': return <SyllabusProgress />;
      case 'reviews': return <CourseReview />;
      default: return <CGPAGraph />;
    }
  };

  return (
    <div className="analytics-page animate-fadeIn">
      <header className="grade-hero">
        <div className="grade-hero-bg" aria-hidden="true">
          <div className="grade-hero-orb grade-hero-orb-1" />
          <div className="grade-hero-orb grade-hero-orb-2" />
          <div className="grade-hero-grid" />
        </div>
        <div className="grade-hero-content">
          <div className="grade-hero-badge">
            <Sparkles size={12} />
            <span>Academic Intelligence</span>
          </div>
          <div className="grade-hero-title-row">
            <div className="grade-hero-icon">
              <FlaskConical size={24} />
            </div>
            <div>
              <h1 className="grade-hero-title">Grade Lab</h1>
              <p className="grade-hero-subtitle">
                Track historical grades, simulate what-if scenarios, and view syllabus completion.
              </p>
            </div>
          </div>
        </div>
      </header>

      <GliderTabs
        tabs={gradeLabTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="gradelab"
      />

      <div className="analytics-content-area" key={activeTab}>
        {renderActiveTab()}
      </div>
    </div>
  );
}
