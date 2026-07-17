import { useMemo } from 'react';
import { Percent, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
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
      if (item.percentage < 75) warningCount++;
    });

    const average = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    return { average: parseFloat(average.toFixed(1)), warningCount };
  }, []);

  const isHealthy = overallStats.average >= 75;
  const dialOffset = useMemo(() => {
    const r = 26;
    const circ = 2 * Math.PI * r;
    return circ - (overallStats.average / 100) * circ;
  }, [overallStats.average]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle ambient glow */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '120px', height: '120px',
        background: isHealthy
          ? 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.08))',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-purple)',
            flexShrink: 0,
          }}>
            <Percent size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: '13px', fontWeight: '600',
              color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>Attendance</div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
              Safe-to-miss tracker
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px', fontWeight: '600',
          letterSpacing: '0.02em',
          background: isHealthy
            ? 'rgba(52,211,153,0.12)'
            : 'rgba(251,113,133,0.12)',
          border: `1px solid ${isHealthy ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
          color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)',
        }}>
          {isHealthy
            ? <><ShieldCheck size={11} /> Safe</>
            : <><AlertTriangle size={11} /> {overallStats.warningCount} At Risk</>
          }
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
          <Percent size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <p style={{ margin: 0 }}>No attendance records</p>
        </div>
      ) : (
        <>
          {/* Overall Score */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            padding: '12px 14px',
          }}>
            {/* SVG Arc Dial */}
            <div style={{ flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke={isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={dialOffset}
                  transform="rotate(-90 32 32)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 4px ${isHealthy ? 'rgba(52,211,153,0.5)' : 'rgba(251,113,133,0.5)'})` }}
                />
                <text x="32" y="36" textAnchor="middle"
                  style={{ fill: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '12px', fontWeight: '700' }}>
                  {overallStats.average}%
                </text>
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Overall Average
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} style={{ color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {isHealthy ? 'Above minimum threshold' : `${overallStats.warningCount} course${overallStats.warningCount > 1 ? 's' : ''} below 75%`}
                </span>
              </div>
            </div>
          </div>

          {/* Course breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attendanceData.slice(0, 4).map((item) => {
              const isDanger = item.percentage < 75;
              const safeCount = item.safeToMiss;
              const accentColor = normalizeAccentColor(item.color);
              const badgeStyle = safeCount === 0
                ? { bg: 'rgba(251,113,133,0.15)', border: 'rgba(251,113,133,0.3)', color: 'var(--accent-rose)' }
                : safeCount <= 2
                ? { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', color: 'var(--accent-amber)' }
                : { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)', color: 'var(--accent-emerald)' };

              return (
                <div key={item.course} style={{
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11.5px', fontWeight: '600',
                      color: 'var(--text-primary)', letterSpacing: '-0.01em',
                      maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{item.course}</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: isDanger ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: '500' }}>
                        {item.attended}/{item.total} · {parseInt(item.percentage)}%
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: '700',
                        padding: '2px 7px', borderRadius: '10px',
                        background: badgeStyle.bg,
                        border: `1px solid ${badgeStyle.border}`,
                        color: badgeStyle.color,
                        letterSpacing: '0.02em',
                      }}>
                        {safeCount} left
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    height: '4px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(item.percentage, 100)}%`,
                      borderRadius: '4px',
                      background: isDanger
                        ? 'linear-gradient(90deg, var(--accent-rose), rgba(251,113,133,0.7))'
                        : `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
                      boxShadow: isDanger
                        ? '0 0 6px rgba(251,113,133,0.4)'
                        : `0 0 6px ${accentColor}66`,
                      transition: 'width 0.6s ease',
                    }} />
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
