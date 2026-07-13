import React, { useState } from 'react';
import { Star, Trophy, Moon } from 'lucide-react';
import CourseReview from '../analytics/CourseReview';
import CoursePoll from '../analytics/CoursePoll';
import GliderTabs from '../../components/GliderTabs';
import './ShadowPage.css';

const shadowTabs = [
  { id: 'reviews', label: 'Reviews', icon: Star, color: 'amber', desc: 'Course ratings' },
  { id: 'bestworst', label: 'Best & Worst', icon: Trophy, color: 'emerald', desc: 'Course poll' },
];

export default function ShadowPage() {
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <div className="shadow-page animate-fadeIn">
      <header className="shadow-hero">
        <div className="shadow-hero-bg" aria-hidden="true">
          <div className="shadow-hero-grid" />
        </div>
        <div className="shadow-hero-content">
          <div className="shadow-hero-title-row">
            <div className="shadow-hero-icon">
              <Moon size={24} />
            </div>
            <div>
              <h1 className="shadow-hero-title">Shadow</h1>
              <p className="shadow-hero-subtitle">
                Anonymous course reviews and polls — no login required.
              </p>
            </div>
          </div>
        </div>
      </header>

      <GliderTabs
        tabs={shadowTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="gradelab"
      />

      <div className="shadow-content-area" key={activeTab}>
        {activeTab === 'reviews' ? <CourseReview /> : <CoursePoll />}
      </div>
    </div>
  );
}
