import React, { useState } from 'react';
import { Award, Star, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addMentor,
  copyContact,
  formatPostedDate,
  getBatchNoFromUser,
  incrementMentorSessions,
  listMentors,
} from '../../utils/marketplaceStorage';

const defaultForm = {
  name: '',
  expertise: '',
  company: '',
  availability: '',
  contact: '',
};

export default function MentorFinder() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState(() => listMentors());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm, name: user.name || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = () => setMentors(listMentors());

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      addMentor({ ...form, batch: getBatchNoFromUser(user) });
      setShowForm(false);
      refresh();
      setMessage('Mentor profile published.');
    } catch (submitError) {
      setError(submitError.message || 'Could not save mentor profile.');
    }
  };

  const handleRequest = async (mentor) => {
    try {
      incrementMentorSessions(mentor.id);
      refresh();
      const result = await copyContact(mentor.contact, `${mentor.name}'s contact`);
      setMessage(result);
      setError('');
    } catch (contactError) {
      setError(contactError.message || 'Could not send request.');
    }
  };

  return (
    <div className="glass-card-static mentor-finder-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
            <Award size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Skill-Based mentors (&quot;Parents&quot;)</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Seniors offering guidance on courses, careers, and skills</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((open) => !open)}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Close' : 'Become a Mentor'}
        </button>
      </div>

      {message && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', marginBottom: '10px' }}>{message}</p>}
      {error && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)', marginBottom: '10px' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Your name
            <input className="input" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required />
          </label>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Expertise
            <input className="input" value={form.expertise} onChange={(e) => setForm((c) => ({ ...c, expertise: e.target.value }))} placeholder="Full Stack, ML, CP..." required />
          </label>
          <div className="grid-2" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Company / role
              <input className="input" value={form.company} onChange={(e) => setForm((c) => ({ ...c, company: e.target.value }))} />
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Availability
              <input className="input" value={form.availability} onChange={(e) => setForm((c) => ({ ...c, availability: e.target.value }))} placeholder="Weekends" required />
            </label>
          </div>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Contact
            <input className="input" value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} required />
          </label>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Publish mentor profile</button>
        </form>
      )}

      {mentors.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px' }}>
          <Award size={36} />
          <h3>No mentors listed yet</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Seniors can share expertise and help juniors navigate AUST.</p>
        </div>
      ) : (
        <div className="grid-3">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
              }}
            >
              <div>
                <div className="flex gap-3 items-start mb-3">
                  <div className="avatar sm" style={{ width: '36px', height: '36px' }}>{mentor.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{mentor.name}</h3>
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      AUST Batch {mentor.batch} • {formatPostedDate(mentor.postedAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', margin: '14px 0' }}>
                  <span>Expertise: <b>{mentor.expertise}</b></span>
                  <span>Current Job: <b>{mentor.company}</b></span>
                  <span>Available: <b>{mentor.availability}</b></span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
                <div>
                  <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)', fontSize: '10px' }}>
                    <Star size={12} fill="currentColor" /> {mentor.rating?.toFixed(1) || '5.0'} ({mentor.sessions || 0} requests)
                  </span>
                </div>

                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleRequest(mentor)} style={{ fontSize: '10px', padding: '4px 10px' }}>
                  Send Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
