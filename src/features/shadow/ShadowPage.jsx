import { useState, useEffect } from 'react';
import { Moon, Eye, Star, Shield } from 'lucide-react';
import CourseReview from '../analytics/CourseReview';
import './ShadowPage.css';

export default function ShadowPage() {
  const [totalReviews] = useState(() => {
    try {
      const raw = localStorage.getItem('aust-course-reviews');
      if (!raw) return 0;
      const reviews = JSON.parse(raw);
      return Array.isArray(reviews) ? reviews.length : 0;
    } catch { return 0; }
  });

  const [uniqueUsers] = useState(() => {
    try {
      const raw = localStorage.getItem('aust-course-reviews');
      if (!raw) return 0;
      const reviews = JSON.parse(raw);
      if (!Array.isArray(reviews) || reviews.length === 0) return 0;
      const userSet = new Set(reviews.map(r => r.userId).filter(Boolean));
      return userSet.size;
    } catch { return 0; }
  });

  const stats = [
    { icon: Eye, value: totalReviews, label: 'Total Reviews', color: 'var(--accent-purple)', bg: 'var(--accent-purple-glow)' },
    { icon: Star, value: uniqueUsers, label: 'Anonymous Reporters', color: 'var(--accent-amber)', bg: 'var(--accent-amber-glow)' },
    { icon: Shield, value: '100%', label: 'Anonymous', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-glow)' },
  ];

  return (
    <div className="shadow-page animate-fadeIn">
      <header className="shadow-hero">
        <div className="shadow-hero-bg" aria-hidden="true">
          <div className="shadow-hero-grid" />
          <div className="shadow-hero-orb shadow-hero-orb-1" />
          <div className="shadow-hero-orb shadow-hero-orb-2" />
        </div>
        <div className="shadow-hero-content">
          <div className="shadow-hero-title-row">
            <div className="shadow-hero-icon">
              <Moon size={24} />
            </div>
            <div>
              <h1 className="shadow-hero-title">
                <span className="shadow-hero-title-highlight">Shadow</span> Reviews
              </h1>
              <p className="shadow-hero-subtitle">
                Anonymous course reviews — no login required. Share your honest feedback and help fellow AUST students.
              </p>
            </div>
          </div>
        </div>
      </header>

      {totalReviews > 0 && (
        <div className="shadow-stats-row">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="shadow-quick-stat-card animate-fadeInUp"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="shadow-quick-stat-shine" aria-hidden="true" />
                <div className="shadow-quick-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                  <Icon size={18} />
                </div>
                <div className="shadow-quick-stat-body">
                  <span className="shadow-quick-stat-value" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="shadow-quick-stat-label">{stat.label}</span>
                </div>
                <div className="shadow-quick-stat-bar" style={{ background: stat.color }} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">
          <span className="icon" style={{ background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)' }}>
            <Star size={16} />
          </span>
          Course Reviews
        </h2>
        <p className="section-subtitle">Anonymous feedback shared by the AUST community</p>
      </div>

      <div className="shadow-content-area">
        <CourseReview />
      </div>
    </div>
  );
}
