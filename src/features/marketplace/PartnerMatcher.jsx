import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addStudyPartner,
  calcPartnerCompatibility,
  copyContact,
  formatPostedDate,
  getBatchNoFromUser,
  getMyStudyPartner,
  listStudyPartners,
} from '../../utils/marketplaceStorage';

const defaultForm = {
  name: '',
  skills: '',
  lookingFor: '',
  contact: '',
};

export default function PartnerMatcher() {
  const { user } = useAuth();
  const [partners, setPartners] = useState(() => listStudyPartners());
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm, name: user.name || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const myProfile = useMemo(() => getMyStudyPartner(), [partners]);

  useEffect(() => {
    if (!showForm || !myProfile) return;
    setForm({
      name: myProfile.name,
      skills: myProfile.skills.join(', '),
      lookingFor: myProfile.lookingFor.join(', '),
      contact: myProfile.contact,
    });
  }, [showForm, myProfile]);

  const refresh = () => setPartners(listStudyPartners());

  const filteredPartners = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return partners
      .filter((partner) =>
        partner.name.toLowerCase().includes(term)
        || partner.skills.some((skill) => skill.toLowerCase().includes(term))
        || partner.lookingFor.some((topic) => topic.toLowerCase().includes(term)),
      )
      .map((partner) => ({
        ...partner,
        compatibility: myProfile
          ? calcPartnerCompatibility(myProfile.lookingFor, partner.skills)
          : calcPartnerCompatibility(partner.skills, partner.lookingFor),
      }));
  }, [partners, searchTerm, myProfile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      addStudyPartner({
        ...form,
        batch: getBatchNoFromUser(user),
        department: user.department,
      });
      setShowForm(false);
      refresh();
      setMessage('Your study partner profile is live.');
    } catch (submitError) {
      setError(submitError.message || 'Could not save profile.');
    }
  };

  const handleMatch = async (partner) => {
    try {
      const result = await copyContact(partner.contact, `${partner.name}'s contact`);
      setMessage(result);
      setError('');
    } catch (contactError) {
      setError(contactError.message || 'Could not copy contact.');
    }
  };

  return (
    <div className="glass-card-static partner-matcher-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <Users size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Study Partner Matcher</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Find classmates for labs, projects, and exam prep</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="search-box" style={{ width: '240px' }}>
            <input
              type="text"
              placeholder="Search partners by skills..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((open) => !open)}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Close' : myProfile ? 'Update Profile' : 'Post Profile'}
          </button>
        </div>
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
            Your skills (comma separated)
            <input className="input" value={form.skills} onChange={(e) => setForm((c) => ({ ...c, skills: e.target.value }))} placeholder="Python, React, Algorithms" required />
          </label>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Looking for (comma separated)
            <input className="input" value={form.lookingFor} onChange={(e) => setForm((c) => ({ ...c, lookingFor: e.target.value }))} placeholder="ML, Database, UI/UX" required />
          </label>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Contact
            <input className="input" value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} required />
          </label>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Save profile</button>
        </form>
      )}

      {filteredPartners.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px' }}>
          <Search size={36} />
          <h3>No partner profiles yet</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Post your skills to help others find you for group study.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
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
                  <div className="avatar sm" style={{ width: '36px', height: '36px' }}>{partner.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{partner.name}</h3>
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {partner.department} • Batch {partner.batch} • {formatPostedDate(partner.postedAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', margin: '14px 0' }}>
                  <span>Skills: <b>{partner.skills.join(', ')}</b></span>
                  <span>Looking for: <b>{partner.lookingFor.join(', ')}</b></span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', display: 'block' }}>Match Rate</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{partner.compatibility}% Match</span>
                </div>

                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleMatch(partner)} style={{ fontSize: '10px', padding: '4px 10px' }}>
                  Match Buddy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
