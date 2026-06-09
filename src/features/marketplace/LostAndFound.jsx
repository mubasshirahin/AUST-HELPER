import React, { useState } from 'react';
import { HelpCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addLostFoundItem,
  claimLostFoundItem,
  copyContact,
  formatPostedDate,
  getSellerLabel,
  listLostFoundItems,
} from '../../utils/marketplaceStorage';

const emojiOptions = ['⌚', '☂️', '💾', '🪪', '📱', '🎒', '👓', '🔑'];

const defaultForm = {
  title: '',
  type: 'lost',
  location: '',
  description: '',
  image: '⌚',
  contact: '',
};

export default function LostAndFound() {
  const { user } = useAuth();
  const [items, setItems] = useState(() => listLostFoundItems());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = () => setItems(listLostFoundItems());

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      addLostFoundItem({ ...form, reporter: getSellerLabel(user) });
      setForm({ ...defaultForm, contact: form.contact });
      setShowForm(false);
      refresh();
      setMessage('Report published on the campus board.');
    } catch (submitError) {
      setError(submitError.message || 'Could not publish report.');
    }
  };

  const handleClaim = async (item) => {
    try {
      claimLostFoundItem(item.id);
      refresh();
      const result = await copyContact(item.contact, 'Reporter contact');
      setMessage(`Marked as claimed. ${result}`);
      setError('');
    } catch (claimError) {
      setError(claimError.message || 'Could not update item.');
    }
  };

  return (
    <div className="glass-card-static lost-found-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-rose-glow)', color: 'var(--accent-rose)', padding: '6px', borderRadius: '8px' }}>
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Lost & Found Desk</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Report or claim items around campus</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((open) => !open)}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Close' : 'Report Item'}
        </button>
      </div>

      {message && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', marginBottom: '10px' }}>{message}</p>}
      {error && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)', marginBottom: '10px' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="grid-2" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Item title
              <input className="input" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} required />
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Type
              <select className="input" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </label>
          </div>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Location
            <input className="input" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} required />
          </label>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Description
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} required />
          </label>
          <div className="grid-2" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Icon
              <select className="input" value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))}>
                {emojiOptions.map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Contact
              <input className="input" value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Post report</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px' }}>
          <HelpCircle size={36} />
          <h3>Board is empty</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Report a lost or found item for the campus community.</p>
        </div>
      ) : (
        <div className="grid-3">
          {items.map((item) => {
            const isLost = item.type === 'lost';
            const isClaimed = item.status === 'claimed';

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-input)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '220px',
                  opacity: isClaimed ? 0.6 : 1,
                  borderLeft: isClaimed ? '4px solid var(--text-tertiary)' : isLost ? '4px solid var(--accent-rose)' : '4px solid var(--accent-emerald)',
                }}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`badge ${isClaimed ? 'badge-blue' : isLost ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '9px' }}>
                      {isClaimed ? 'CLAIMED' : isLost ? 'LOST' : 'FOUND'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{formatPostedDate(item.postedAt)}</span>
                  </div>

                  <div className="flex gap-3 items-center" style={{ margin: '10px 0' }}>
                    <span style={{ fontSize: '24px' }}>{item.image}</span>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h3>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Location: <b>{item.location}</b></p>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.description}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '6px' }}>By {item.reporter}</p>
                </div>

                <div className="flex justify-end mt-4 pt-3" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={isClaimed}
                    onClick={() => handleClaim(item)}
                    style={{ fontSize: '10px' }}
                  >
                    {isClaimed ? 'Resolved' : isLost ? 'Found This' : 'Claim Item'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
