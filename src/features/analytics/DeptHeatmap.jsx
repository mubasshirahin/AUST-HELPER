import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatSemesterLabel } from '../../utils/semester';
import {
  MIN_BATCH_CONTRIBUTORS,
  MIN_CELL_CONTRIBUTORS,
  HEATMAP_SEMESTER_COUNT,
  buildHeatmapView,
  getBatchNoFromUser,
  heatmapDepartments,
} from '../../utils/deptHeatmapStorage';

const semesterNumbers = Array.from({ length: HEATMAP_SEMESTER_COUNT }, (_, index) => index + 1);

export default function DeptHeatmap() {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = React.useState(user.department || 'CSE');
  const userBatchNo = getBatchNoFromUser(user);

  const heatmapView = useMemo(
    () => buildHeatmapView(selectedDepartment),
    [selectedDepartment, user.department, user.batch, user.batchNo],
  );

  const userPendingBatch = heatmapView.pendingBatches.find((batch) => batch.batchNo === userBatchNo);

  const getCellColor = (val) => {
    if (val === null) return 'rgba(255,255,255,0.03)';
    if (val >= 3.5) return 'var(--accent-emerald)';
    if (val >= 3.2) return 'var(--accent-blue)';
    if (val >= 2.8) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const getCellOpacity = (val) => {
    if (val === null) return 0.2;
    if (val >= 3.5) return 0.9;
    if (val >= 3.2) return 0.75;
    if (val >= 2.8) return 0.6;
    return 0.8;
  };

  return (
    <div className="glass-card-static dept-heatmap-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-rose-glow)', color: 'var(--accent-rose)', padding: '6px', borderRadius: '8px' }}>
            <Flame size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Dept. CGPA Heatmap</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
              Averages CGPA from {heatmapView.totalSubmissions} students across {heatmapView.visibleBatches.length + heatmapView.pendingBatches.length} batches
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Department</span>
          <select
            className="input"
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            style={{ minWidth: '120px', width: 'auto' }}
          >
            {heatmapDepartments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </label>
      </div>

      {userBatchNo && userPendingBatch && (
        <div className="flex gap-3 flex-wrap" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <span>Your batch ({userBatchNo}): <strong style={{color: userPendingBatch.contributorCount >= MIN_BATCH_CONTRIBUTORS ? 'var(--accent-emerald)' : 'var(--accent-amber)'}}>{userPendingBatch.contributorCount}/{MIN_BATCH_CONTRIBUTORS}</strong> contributors</span>
        </div>
      )}

      {heatmapView.visibleBatches.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <Flame size={36} />
          <h3>No batch data visible yet</h3>
          <p style={{ maxWidth: '520px', margin: '0 auto' }}>
            {heatmapView.pendingBatches.length > 0
              ? `${heatmapView.pendingBatches.length} batch(es) are collecting CGPA Tracker saves. Each batch needs ${MIN_BATCH_CONTRIBUTORS}+ students before its row appears.`
              : `Save semester results in CGPA Tracker (with batch set in Settings). Once ${MIN_BATCH_CONTRIBUTORS}+ students from the same batch contribute, averages will show here.`}
          </p>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(8, 1fr)', gap: '6px', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div>Batch</div>
              {semesterNumbers.map((semester) => (
                <div key={semester}>{formatSemesterLabel(semester)}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {heatmapView.visibleBatches.map((batch) => {
                const isUserBatch = batch.batchNo === userBatchNo;

                return (
                  <div
                    key={batch.batchNo}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px repeat(8, 1fr)',
                      gap: '6px',
                      alignItems: 'center',
                      background: isUserBatch ? 'var(--accent-blue-glow)' : 'transparent',
                      padding: '4px 0',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ paddingLeft: '8px', fontSize: '12px', fontWeight: isUserBatch ? 'bold' : 'normal', color: isUserBatch ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                      {batch.label}{isUserBatch ? ' (You)' : ''}
                      <span style={{ display: 'inline-flex', alignItems:'center', gap:'3px', marginLeft:'8px', fontSize:'9px', fontWeight:'bold', padding:'1px 8px', borderRadius:'10px', background:batch.contributorCount >= MIN_BATCH_CONTRIBUTORS ? 'var(--accent-emerald-glow)' : 'var(--accent-amber-glow)', color:batch.contributorCount >= MIN_BATCH_CONTRIBUTORS ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {batch.contributorCount}/{MIN_BATCH_CONTRIBUTORS} students
                      </span>
                    </div>

                    {batch.cells.map((gpa, semIdx) => (
                      <div
                        key={semIdx}
                        className="heatmap-cell tooltip-wrapper"
                        style={{
                          backgroundColor: getCellColor(gpa),
                          opacity: getCellOpacity(gpa),
                          aspectRatio: '1.6',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: gpa !== null ? '#fff' : 'var(--text-tertiary)',
                          boxShadow: isUserBatch && gpa !== null ? '0 0 6px var(--accent-blue)' : 'none',
                        }}
                      >
                        {gpa !== null ? gpa.toFixed(2) : '—'}
                        <div className="tooltip">
                          {batch.label} • {formatSemesterLabel(semIdx + 1)}:{' '}
                          {gpa !== null ? `${gpa} avg CGPA` : `Needs ${MIN_CELL_CONTRIBUTORS}+ CGPA Tracker entries`}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
      )}

      {/* ── Batch-wise contributor counter ── */}
      {(heatmapView.visibleBatches.length > 0 || heatmapView.pendingBatches.length > 0) && (
        <div style={{ marginTop: '16px', padding:'12px', background:'var(--bg-input)', borderRadius:'var(--radius-md)', fontSize: 'var(--fs-xs)' }}>
          <strong style={{ color: 'var(--text-primary)', fontSize:'11px' }}>Collected Data:</strong>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'6px' }}>
            {[...heatmapView.visibleBatches, ...heatmapView.pendingBatches].sort((a,b)=>Number(b.batchNo)-Number(a.batchNo)).map((batch) => (
              <span key={batch.batchNo} style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'var(--bg-card)', padding:'3px 10px', borderRadius:'12px', fontSize:'11px' }}>
                <span style={{fontWeight:'600'}}>{batch.label}</span>
                <span style={{ fontWeight:'bold', color:batch.contributorCount >= MIN_BATCH_CONTRIBUTORS ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {batch.contributorCount}
                </span>
                <span style={{color:'var(--text-tertiary)'}}>students</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-center p-3" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '11px', marginTop: '20px' }}>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 'bold' }}>Heatmap Legend:</span>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-emerald)' }}></span> High CGPA (3.5+)</div>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-blue)' }}></span> Moderate (3.2-3.5)</div>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-amber)' }}></span> Average (2.8-3.2)</div>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--accent-rose)' }}></span> Critical (&lt;2.8)</div>
      </div>
    </div>
  );
}
