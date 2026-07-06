import React, { useState, useMemo } from 'react';
import { ThumbsUp, ThumbsDown, Trophy, Users, Send, Trash2, Award } from 'lucide-react';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import {
  MAX_PICKS,
  getMyBallot,
  saveMyBallot,
  getBestLeaderboard,
  getWorstLeaderboard,
  getTotalVoters,
} from '../../utils/coursePollStorage';

// An editable list of up to MAX_PICKS course slots.
function PickList({ title, icon, accent, picks, setPicks }) {
  const addSlot = () => {
    if (picks.length >= MAX_PICKS) return;
    setPicks([...picks, { code: '', name: '' }]);
  };

  const updateSlot = (index, course) => {
    const next = [...picks];
    if (!course) {
      // Cleared the input.
      next[index] = { code: '', name: '' };
    } else if (course.partialUpdate) {
      // User typed a code without selecting a suggestion — keep any existing name.
      next[index] = { code: course.code ?? next[index].code, name: next[index].name };
    } else {
      next[index] = { code: course.code || '', name: course.name || '' };
    }
    setPicks(next);
  };

  const removeSlot = (index) => {
    setPicks(picks.filter((_, i) => i !== index));
  };

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="flex items-center gap-2" style={{ color: accent }}>
        {icon}
        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: 0 }}>{title}</h4>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
          {picks.length}/{MAX_PICKS}
        </span>
      </div>

      {picks.map((pick, index) => (
        <div key={index} className="flex items-center gap-2">
          <div style={{ flex: 1 }}>
            <CourseAutocomplete
              value={pick.code}
              onCourseSelect={(course) => updateSlot(index, course)}
              placeholder="e.g. CSE 3101"
              type="code"
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => removeSlot(index)}
            style={{ border: 'none', background: 'transparent', color: 'var(--accent-rose)', padding: '4px', width: '28px', height: '28px' }}
            aria-label="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {picks.length < MAX_PICKS && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={addSlot} style={{ fontSize: '11px' }}>
          + Add course
        </button>
      )}
    </div>
  );
}

// A ranked leaderboard box: courses ordered by votes, most-voted on top.
function Leaderboard({ title, icon, accent, rows, totalVoters }) {
  const maxVotes = rows.length > 0 ? rows[0].votes : 0;

  return (
    <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2" style={{ color: accent }}>
          {icon}
          <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', margin: 0 }}>{title}</h3>
        </div>
        <span className="flex items-center gap-1" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          <Users size={12} /> {totalVoters} voted
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px 16px' }}>
          <Trophy size={32} style={{ opacity: 0.5 }} />
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '8px' }}>
            No votes yet. Be the first to pick.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map((row, index) => (
            <div
              key={row.code}
              className="flex items-center gap-3 p-3"
              style={{
                background: 'var(--bg-input)',
                border: `1px solid ${index === 0 ? accent : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Rank */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: index === 0 ? accent : 'var(--text-tertiary)',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </span>

              {/* Course + vote bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{row.code}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    {row.votes} {row.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.name}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${maxVotes > 0 ? (row.votes / maxVotes) * 100 : 0}%`, background: accent }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursePoll() {
  const existing = useMemo(() => getMyBallot(), []);
  const [best, setBest] = useState(() => existing?.best?.map((c) => ({ ...c })) || [{ code: '', name: '' }]);
  const [worst, setWorst] = useState(() => existing?.worst?.map((c) => ({ ...c })) || [{ code: '', name: '' }]);
  const [version, setVersion] = useState(0); // bump to refresh leaderboards
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const bestBoard = useMemo(() => getBestLeaderboard(), [version]);
  const worstBoard = useMemo(() => getWorstLeaderboard(), [version]);
  const totalVoters = useMemo(() => getTotalVoters(), [version]);

  const submit = (e) => {
    e.preventDefault();
    try {
      saveMyBallot(best, worst);
      setError('');
      setMessage('Your picks are saved. The rankings update below.');
      setVersion((v) => v + 1);
    } catch (err) {
      setMessage('');
      setError(err.message);
    }
  };

  return (
    <div className="glass-card-static animate-fadeInUp">
      <div className="mb-6">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Best &amp; Worst Courses</h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
          Pick up to {MAX_PICKS} favourite and {MAX_PICKS} least-favourite courses. The most-voted courses rise to the top.
        </p>
      </div>

      {/* Voting form */}
      <form onSubmit={submit} className="mb-6">
        <div className="grid-2" style={{ gap: '16px' }}>
          <PickList
            title="Your Best Courses"
            icon={<ThumbsUp size={16} />}
            accent="var(--accent-emerald)"
            picks={best}
            setPicks={setBest}
          />
          <PickList
            title="Your Worst Courses"
            icon={<ThumbsDown size={16} />}
            accent="var(--accent-rose)"
            picks={worst}
            setPicks={setWorst}
          />
        </div>

        {error && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)', marginTop: '12px' }}>{error}</p>}
        {message && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', marginTop: '12px' }}>{message}</p>}

        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '14px' }}>
          <Send size={14} /> {existing ? 'Update my picks' : 'Submit my picks'}
        </button>
      </form>

      {/* Ranked leaderboards */}
      <div className="grid-2" style={{ gap: '16px' }}>
        <Leaderboard
          title="Top Rated Courses"
          icon={<Award size={18} />}
          accent="var(--accent-emerald)"
          rows={bestBoard}
          totalVoters={totalVoters}
        />
        <Leaderboard
          title="Lowest Rated Courses"
          icon={<ThumbsDown size={18} />}
          accent="var(--accent-rose)"
          rows={worstBoard}
          totalVoters={totalVoters}
        />
      </div>
    </div>
  );
}
