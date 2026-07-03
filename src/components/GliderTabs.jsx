import { useEffect, useRef } from 'react';
import './GliderTabs.css';

export default function GliderTabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  compact = false,
}) {
  const trackRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const active = activeRef.current;
    if (!track || !active) return;

    const trackRect = track.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    track.style.setProperty('--glider-x', `${activeRect.left - trackRect.left}px`);
    track.style.setProperty('--glider-w', `${activeRect.width}px`);
  }, [activeTab, tabs, compact]);

  return (
    <div className={`glider-tabs-wrap glider-tabs-${variant} ${compact ? 'glider-tabs-compact' : ''}`}>
      <div className="glider-tabs-track" ref={trackRef} role="tablist">
        <div className="glider-tabs-glider" aria-hidden="true" />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`glider-tab ${isActive ? 'active' : ''} ${tab.color ? `glider-tab-${tab.color}` : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {Icon && (
                <span className="glider-tab-icon">
                  <Icon size={compact ? 15 : 16} />
                </span>
              )}
              <span className="glider-tab-text">
                <span className="glider-tab-label">{tab.label}</span>
                {tab.desc && !compact && (
                  <span className="glider-tab-desc">{tab.desc}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
