import React from 'react';
import { Moon } from 'lucide-react';
import CourseReview from '../analytics/CourseReview';
import './ShadowPage.css';

export default function ShadowPage() {
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
                Anonymous course reviews — no login required.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="shadow-content-area">
        <CourseReview />
      </div>
    </div>
  );
}
