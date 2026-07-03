import React, { useEffect, useRef } from 'react';
import {
  BookOpen,
  BarChart3,
  FolderOpen,
  Play,
} from 'lucide-react';

const tabMeta = {
  qb: { icon: BookOpen, color: 'blue', desc: 'Past papers' },
  heatmap: { icon: BarChart3, color: 'purple', desc: 'Topic trends' },
  materials: { icon: FolderOpen, color: 'emerald', desc: 'Lecture notes' },
  playlists: { icon: Play, color: 'rose', desc: 'Video lists' },
};

export default function VaultResourceTabs({ tabs, activeTab, onChange }) {
  const trackRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const active = activeRef.current;
    if (!track || !active) return;

    const trackRect = track.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    track.style.setProperty('--vault-tab-x', `${activeRect.left - trackRect.left}px`);
    track.style.setProperty('--vault-tab-w', `${activeRect.width}px`);
  }, [activeTab, tabs]);

  return (
    <div className="vault-resource-slider-wrap">
      <div className="vault-resource-slider" ref={trackRef}>
        <div className="vault-resource-slider-glider" aria-hidden="true" />
        {tabs.map((tab) => {
          const meta = tabMeta[tab.id] || { icon: BookOpen, color: 'blue', desc: '' };
          const Icon = meta.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              type="button"
              className={`vault-resource-tab ${isActive ? 'active' : ''} vault-resource-tab-${meta.color}`}
              onClick={() => onChange(tab.id)}
              aria-selected={isActive}
            >
              <span className="vault-resource-tab-icon">
                <Icon size={16} />
              </span>
              <span className="vault-resource-tab-text">
                <span className="vault-resource-tab-label">{tab.label}</span>
                <span className="vault-resource-tab-desc">{meta.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
