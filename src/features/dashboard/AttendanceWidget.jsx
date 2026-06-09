import { useMemo } from 'react';
import { Percent, AlertCircle, CheckCircle2 } from 'lucide-react';
import { attendanceData } from '../../data/mockData';
import { normalizeAccentColor } from '../../utils/colorPalette';

export default function AttendanceWidget() {
  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    let warningCount = 0;

    attendanceData.forEach(item => {
      totalAttended += item.attended;
      totalClasses += item.total;
      if (item.percentage < 75) {
        warningCount++;
      }
    });

    const average = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    return {
      average: parseFloat(average.toFixed(1)),
      warningCount
    };
  }, []);

  return (
    <div className="glass-card-static attendance-widget animate-fadeInUp">
      <div className="flex items-center gap-2 mb-4">
        <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
          <Percent size={18} />
        </div>
        <div>
          <h3 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Attendance</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Safe-to-miss tracker</p>
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 0' }}>
          <Percent size={32} />
          <p>No attendance records</p>
        </div>
      ) : (
        <>
          {/* Overall Score Dial/Bar */}
          <div className="flex items-center justify-between mb-4 p-3" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-bold)', color: overallStats.average >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {overallStats.average}%
              </span>
              <p style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Overall attendance</p>
            </div>
            <div>
              {overallStats.warningCount > 0 ? (
                <div className="flex items-center gap-1 text-rose" style={{ color: 'var(--accent-rose)', fontSize: 'var(--fs-xs)' }}>
                  <AlertCircle size={14} />
                  <span>{overallStats.warningCount} Danger Alert</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald" style={{ color: 'var(--accent-emerald)', fontSize: 'var(--fs-xs)' }}>
                  <CheckCircle2 size={14} />
                  <span>Safe (all &gt;75%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Course level details */}
          <div className="attendance-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attendanceData.slice(0, 4).map((item) => {
              const isDanger = item.percentage < 75;
              const safeCount = item.safeToMiss;
              const accentColor = normalizeAccentColor(item.color);

              return (
                <div key={item.course} style={{ fontSize: '12px' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span style={{ fontWeight: 'var(--fw-medium)' }}>{item.course}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: isDanger ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                        {item.attended}/{item.total} ({parseInt(item.percentage)}%)
                      </span>
                      <span 
                        className={`badge ${safeCount === 0 ? 'badge-rose' : safeCount <= 2 ? 'badge-amber' : 'badge-emerald'}`}
                        style={{ fontSize: '9px', padding: '1px 6px' }}
                      >
                        {safeCount} left
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${item.percentage}%`,
                        background: isDanger ? 'var(--accent-rose)' : accentColor
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
