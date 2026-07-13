import { useState } from 'react';
import { BellRing, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { notices } from '../../data/mockData';

export default function NoticeBoard() {
  const [expandedNotice, setExpandedNotice] = useState(null);
  const [noticesList] = useState(() => {
    try {
      const stored = localStorage.getItem('aust-notices');
      return stored ? JSON.parse(stored) : notices;
    } catch {
      return notices;
    }
  });

  const toggleExpand = (id) => {
    if (expandedNotice === id) {
      setExpandedNotice(null);
    } else {
      setExpandedNotice(id);
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Exam': return 'badge-rose';
      case 'Library': return 'badge-cyan';
      case 'Event': return 'badge-purple';
      case 'Admin': return 'badge-amber';
      case 'IT': return 'badge-blue';
      default: return 'badge-blue';
    }
  };

  return (
    <div className="glass-card-static notice-board animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '6px', borderRadius: '8px' }}>
            <BellRing size={18} />
          </div>
          <div>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Official University Announcements</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
        {noticesList.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <BellRing size={32} />
            <p>No notices posted</p>
          </div>
        ) : noticesList.map((notice) => {
          const isExpanded = expandedNotice === notice.id;
          
          return (
            <div 
              key={notice.id}
              className="notice-item"
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                border: notice.pinned ? '1px solid var(--accent-amber-glow)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
              onClick={() => toggleExpand(notice.id)}
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {notice.pinned && (
                      <span className="badge badge-amber" style={{ fontSize: '8px', padding: '1px 4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Pin size={8} /> PINNED
                      </span>
                    )}
                    <span className={`badge ${getCategoryBadgeClass(notice.category)}`} style={{ fontSize: '8px', padding: '1px 4px' }}>
                      {notice.category}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{notice.date}</span>
                  </div>
                  <h4 style={{ fontSize: '13px', fontWeight: 'var(--fw-semibold)', color: notice.pinned ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {notice.title}
                  </h4>
                </div>
                <button style={{ color: 'var(--text-tertiary)', padding: '2px' }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {isExpanded ? (
                <div className="notice-details mt-2 animate-fadeIn" style={{ fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-primary)', paddingTop: '8px', lineHeight: '1.4' }}>
                  <p>{notice.content}</p>
                </div>
              ) : (
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                  {notice.content}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
