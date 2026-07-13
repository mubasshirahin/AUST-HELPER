import React, { useState, useMemo, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Trophy, Users, Send, Award, CheckCircle } from 'lucide-react';
import CourseAutocomplete from '../../components/CourseAutocomplete';
import {
  MAX_PICKS,
  getMyBallot,
  saveMyBallot,
  getBestLeaderboard,
  getWorstLeaderboard,
  getTotalVoters,
  clearAllPollData,
} from '../../utils/coursePollStorage';

function PickList({ title, icon, accent, picks, setPicks }) {
  const updateSlot = (index, course) => {
    const next = [...picks];
    if (!course) {
      next[index] = { code: '', name: '' };
    } else if (course.partialUpdate) {
      next[index] = { code: course.code ?? next[index].code, name: next[index].name };
    } else {
      next[index] = { code: course.code || '', name: course.name || '' };
    }
    setPicks(next);
  };

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="flex items-center gap-2" style={{ color: accent }}>
        {icon}
        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', margin: 0 }}>{title}</h4>
      </div>

      {picks.map((pick, index) => (
        <CourseAutocomplete
          key={index}
          value={pick.code}
          onCourseSelect={(course) => updateSlot(index, course)}
          placeholder="e.g. CSE 1101"
          type="code"
        />
      ))}
    </div>
  );
}

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
  const [voted, setVoted] = useState(() => !!getMyBallot());
  const [best, setBest] = useState(() =>
    Array.from({ length: MAX_PICKS }, () => ({ code: '', name: '' }))
  );
  const [worst, setWorst] = useState(() =>
    Array.from({ length: MAX_PICKS }, () => ({ code: '', name: '' }))
  );
  const [version, setVersion] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    clearAllPollData();
    setVoted(false);
  }, []);

  const bestBoard = useMemo(() => getBestLeaderboard(), [version]);
  const worstBoard = useMemo(() => getWorstLeaderboard(), [version]);
  const totalVoters = useMemo(() => getTotalVoters(), [version]);

  const submit = (e) => {
    e.preventDefault();
    try {
      saveMyBallot(best, worst);
      setError('');
      setVoted(true);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  if (voted) {
    return (
      <div className="glass-card-static animate-fadeInUp">
        <div className="mb-6">
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Best &amp; Worst Courses</h2>
        </div>

        <div className="flex items-center gap-3 mb-6" style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle size={20} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 'bold', margin: 0 }}>Your vote has been recorded</p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Thanks for sharing your opinion! You cannot change or delete your vote.
            </p>
          </div>
        </div>

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

  return (
    <div className="glass-card-static animate-fadeInUp">
      <div className="mb-6">
        <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Best &amp; Worst Courses</h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
          Pick up to {MAX_PICKS} favourite and {MAX_PICKS} least-favourite courses.
          Your vote is one-time only — you cannot change or delete it after submitting.
        </p>
      </div>

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

        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '14px' }}>
          <Send size={14} /> Submit my picks
        </button>
      </form>

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
