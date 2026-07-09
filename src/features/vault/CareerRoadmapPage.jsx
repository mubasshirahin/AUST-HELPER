import React, { useState, useCallback } from 'react';
import {
  Map, TrendingUp, Clock, Zap,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
  Circle, BookOpen, Wrench, Trophy, Target,
} from 'lucide-react';
import { careerTracks, trackMilestones, phaseOrder } from '../../data/careerRoadmapData';
import GliderTabs from '../../components/GliderTabs';
import './CareerRoadmapPage.css';

const STORAGE_KEY = 'crp_progress';
const TAB_KEY = 'crp_active_track';

// Phase icon map
const phaseIcons = {
  Foundation: BookOpen,
  'Core Skills': Wrench,
  'Career Ready': Trophy,
};

// Load saved progress from localStorage
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// Save progress to localStorage
function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Compute overall % for a track
function computeTrackProgress(milestones, completed) {
  const total = milestones.length;
  if (!total) return 0;
  const done = milestones.filter((m) => completed[m.id]).length;
  return Math.round((done / total) * 100);
}

export default function CareerRoadmapPage() {
  const [activeTrack, setActiveTrack] = useState(
    () => localStorage.getItem(TAB_KEY) || careerTracks[0].id
  );
  const [completed, setCompleted] = useState(loadProgress);
  const [expandedId, setExpandedId] = useState(null);

  const handleTrackChange = (id) => {
    setActiveTrack(id);
    setExpandedId(null);
    localStorage.setItem(TAB_KEY, id);
  };

  const toggleMilestone = useCallback((milestoneId) => {
    setCompleted((prev) => {
      const next = { ...prev, [milestoneId]: !prev[milestoneId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const track = careerTracks.find((t) => t.id === activeTrack);
  const milestones = trackMilestones[activeTrack] || [];
  const overallProgress = computeTrackProgress(milestones, completed);

  // Group milestones by phase
  const grouped = phaseOrder.map((phase) => ({
    phase,
    items: milestones.filter((m) => m.phase === phase),
  })).filter((g) => g.items.length > 0);

  // Build tabs for GliderTabs
  const tabs = careerTracks.map((t) => ({
    id: t.id,
    label: t.label,
    desc: t.desc,
    color: t.color,
  }));

  return (
    <div className="crp-page animate-fadeIn">

      {/* ── Hero ── */}
      <header className="crp-hero">
        <div className="crp-hero-bg" aria-hidden="true">
          <div className="crp-hero-grid" />
        </div>
        <div className="crp-hero-content">
          <div className="crp-hero-title-row">
            <div className="crp-hero-icon">
              <Map size={24} />
            </div>
            <div>
              <h1 className="crp-hero-title">Career Roadmaps</h1>
              <p className="crp-hero-subtitle">
                Step-by-step paths, curated skills, and real resources to land your dream tech role.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Track Tabs ── */}
      <GliderTabs
        tabs={tabs}
        activeTab={activeTrack}
        onChange={handleTrackChange}
        variant="gradelab"
      />

      {/* ── Track Overview Card ── */}
      {track && (
        <div className="crp-overview-card">
          <div className="crp-overview-left">
            <span className="crp-track-emoji">{track.icon}</span>
            <div>
              <h2 className="crp-overview-title">{track.label}</h2>
              <p className="crp-overview-desc">{track.overview}</p>
            </div>
          </div>
          <div className="crp-overview-stats">
            <div className="crp-stat">
              <TrendingUp size={14} />
              <span className="crp-stat-label">Demand</span>
              <span className={`crp-stat-value crp-demand-${track.demand === 'Very High' ? 'veryhigh' : 'high'}`}>
                {track.demand}
              </span>
            </div>
            <div className="crp-stat">
              <Zap size={14} />
              <span className="crp-stat-label">Avg Salary</span>
              <span className="crp-stat-value">{track.avgSalary}</span>
            </div>
            <div className="crp-stat">
              <Clock size={14} />
              <span className="crp-stat-label">Time to Ready</span>
              <span className="crp-stat-value">{track.timeToReady}</span>
            </div>
            <div className="crp-stat crp-stat-progress">
              <Target size={14} />
              <span className="crp-stat-label">Your Progress</span>
              <div className="crp-overall-bar-wrap">
                <div className="crp-overall-bar">
                  <div
                    className="crp-overall-bar-fill"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <span className="crp-overall-pct">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Phases & Milestones ── */}
      <div className="crp-phases">
        {grouped.map(({ phase, items }, groupIdx) => {
          const PhaseIcon = phaseIcons[phase] || BookOpen;
          const phaseDone = items.filter((m) => completed[m.id]).length;

          return (
            <section key={phase} className="crp-phase-section">
              {/* Phase header */}
              <div className="crp-phase-header">
                <div className={`crp-phase-icon crp-phase-icon-${groupIdx}`}>
                  <PhaseIcon size={16} />
                </div>
                <div className="crp-phase-meta">
                  <span className="crp-phase-label">{phase}</span>
                  <span className="crp-phase-count">{phaseDone}/{items.length} done</span>
                </div>
                {groupIdx < grouped.length - 1 && (
                  <div className="crp-phase-connector" aria-hidden="true" />
                )}
              </div>

              {/* Milestone cards */}
              <div className="crp-milestone-list">
                {items.map((milestone, idx) => {
                  const isDone = !!completed[milestone.id];
                  const isExpanded = expandedId === milestone.id;

                  return (
                    <div
                      key={milestone.id}
                      className={`crp-milestone-card ${isDone ? 'crp-milestone-done' : ''} ${isExpanded ? 'crp-milestone-expanded' : ''}`}
                    >
                      {/* Card header row */}
                      <div
                        className="crp-milestone-header"
                        onClick={() => toggleExpand(milestone.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleExpand(milestone.id)}
                        aria-expanded={isExpanded}
                      >
                        {/* Step number / check */}
                        <button
                          type="button"
                          className={`crp-check-btn ${isDone ? 'crp-check-done' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleMilestone(milestone.id); }}
                          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                          title={isDone ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isDone
                            ? <CheckCircle2 size={20} />
                            : <Circle size={20} />
                          }
                        </button>

                        {/* Title & duration */}
                        <div className="crp-milestone-info">
                          <h3 className={`crp-milestone-title ${isDone ? 'crp-title-done' : ''}`}>
                            {milestone.title}
                          </h3>
                          <p className="crp-milestone-desc">{milestone.desc}</p>
                        </div>

                        {/* Duration badge + expand toggle */}
                        <div className="crp-milestone-right">
                          <span className="crp-duration-badge">
                            <Clock size={11} />
                            {milestone.duration}
                          </span>
                          {isExpanded
                            ? <ChevronUp size={16} className="crp-chevron" />
                            : <ChevronDown size={16} className="crp-chevron" />
                          }
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="crp-milestone-detail animate-fadeIn">

                          {/* Skills */}
                          <div className="crp-detail-section">
                            <span className="crp-detail-heading">Skills you'll gain</span>
                            <div className="crp-skill-chips">
                              {milestone.skills.map((skill) => (
                                <span key={skill} className="crp-skill-chip">{skill}</span>
                              ))}
                            </div>
                          </div>

                          {/* Resources */}
                          <div className="crp-detail-section">
                            <span className="crp-detail-heading">Resources</span>
                            <div className="crp-resource-list">
                              {milestone.resources.map((res) => (
                                <a
                                  key={res.label}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="crp-resource-link"
                                >
                                  <BookOpen size={13} />
                                  <span>{res.label}</span>
                                  <ExternalLink size={11} className="crp-ext-icon" />
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Mark complete CTA */}
                          <button
                            type="button"
                            className={`crp-complete-btn ${isDone ? 'crp-complete-btn-undo' : ''}`}
                            onClick={() => toggleMilestone(milestone.id)}
                          >
                            {isDone ? (
                              <><Circle size={14} /> Mark Incomplete</>
                            ) : (
                              <><CheckCircle2 size={14} /> Mark as Complete</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Completion Banner ── */}
      {overallProgress === 100 && (
        <div className="crp-completion-banner animate-fadeInUp">
          <Trophy size={28} />
          <div>
            <strong>Track Complete!</strong>
            <p>You've finished all milestones for {track?.label}. Time to apply!</p>
          </div>
        </div>
      )}
    </div>
  );
}
