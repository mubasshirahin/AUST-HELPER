import React, { useMemo } from 'react';
import { Route, CheckCircle, ShieldAlert } from 'lucide-react';
import { prerequisiteTree } from '../../data/mockData';

export default function PrerequisiteTree() {
  const nodesBySemester = useMemo(() => {
    const list = {};
    prerequisiteTree.nodes.forEach(node => {
      if (!list[node.semester]) {
        list[node.semester] = [];
      }
      list[node.semester].push(node);
    });
    return list;
  }, []);

  const getNodeColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--accent-emerald)';
      case 'current': return 'var(--accent-blue)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'current': return 'Currently Enrolled';
      default: return 'Locked (requires prerequisites)';
    }
  };

  return (
    <div className="glass-card-static prerequisites-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
            <Route size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Course Prerequisites Tree</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Visually map unlocked pathways based on prerequisites</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Visual Map pathways */}
        <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '12px' }}>
          <div style={{ minWidth: '650px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(nodesBySemester).sort().map(semNum => (
              <div 
                key={semNum}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  alignItems: 'center',
                  gap: '20px',
                  background: 'var(--bg-input)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                  Semester {semNum}
                </div>

                <div className="flex gap-4 flex-wrap">
                  {nodesBySemester[semNum].map(node => (
                    <div 
                      key={node.id}
                      className="tooltip-wrapper"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: `1px solid ${getNodeColor(node.status)}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        minWidth: '150px'
                      }}
                      onClick={() => alert(`Course details: ${node.name}. Requires: ${(node.prereqs || []).join(', ') || 'None'}`)}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>{node.id}</span>
                      <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
                      
                      <div className="tooltip">
                        Prerequisites: {(node.prereqs || []).join(', ') || 'None'} ({getStatusText(node.status)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 flex-wrap p-3" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
          <div className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-emerald)' }}></span> Completed</div>
          <div className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-blue)' }}></span> Currently Enrolled</div>
          <div className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: 'var(--text-tertiary)' }}></span> Locked / Pending</div>
        </div>
      </div>
    </div>
  );
}
