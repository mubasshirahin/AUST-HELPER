import React, { useState } from 'react';
import { ShoppingCart, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addExchangeItem,
  copyContact,
  formatPostedDate,
  getSellerLabel,
  listExchangeItems,
} from '../../utils/marketplaceStorage';

const categories = ['Books', 'Lab Equipment', 'Stationery', 'Electronics', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair'];
const emojiOptions = ['📘', '🔌', '🤖', '🧮', '📗', '🔧', '📱', '🎒'];

const defaultForm = {
  title: '',
  price: '',
  condition: 'Good',
  category: 'Books',
  image: '📘',
  contact: '',
};

export default function ExchangeKits() {
  const { user } = useAuth();
  const [items, setItems] = useState(() => listExchangeItems());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = () => setItems(listExchangeItems());

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      addExchangeItem({ ...form, seller: getSellerLabel(user) });
      setForm({ ...defaultForm, contact: form.contact });
      setShowForm(false);
      refresh();
      setMessage('Listing published.');
    } catch (submitError) {
      setError(submitError.message || 'Could not publish listing.');
    }
  };

  const handleContact = async (item) => {
    try {
      const result = await copyContact(item.contact, 'Seller contact');
      setMessage(result);
      setError('');
    } catch (contactError) {
      setError(contactError.message || 'Could not copy contact.');
    }
  };

  return (
    <div className="glass-card-static exchange-kits-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <ShoppingCart size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Exchange Kits & Books</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Peer-to-peer listings from AUST students</p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setShowForm((open) => !open);
            setError('');
            setMessage('');
          }}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Close' : 'Sell Product'}
        </button>
      </div>

      {message && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', marginBottom: '10px' }}>{message}</p>}
      {error && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)', marginBottom: '10px' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="grid-2" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Product title
              <input className="input" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} required />
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Price (৳)
              <input className="input" type="number" min="0" value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} required />
            </label>
          </div>
          <div className="grid-3" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Category
              <select className="input" value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Condition
              <select className="input" value={form.condition} onChange={(e) => setForm((c) => ({ ...c, condition: e.target.value }))}>
                {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Icon
              <select className="input" value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))}>
                {emojiOptions.map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
              </select>
            </label>
          </div>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Contact (phone / WhatsApp)
            <input className="input" value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} placeholder="+880..." required />
          </label>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Publish listing</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px' }}>
          <ShoppingCart size={36} />
          <h3>No listings yet</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Be the first to sell books, lab kits, or stationery.</p>
        </div>
      ) : (
        <div className="grid-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
              }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>{item.category}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{formatPostedDate(item.postedAt)}</span>
                </div>

                <div className="flex gap-4 items-center" style={{ margin: '10px 0' }}>
                  <span style={{ fontSize: '28px', background: 'var(--bg-secondary)', width: '48px', height: '48px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Condition: <b>{item.condition}</b></p>
                  </div>
                </div>

                <div style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '8px' }}>
                  ৳ {item.price}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Owner: {item.seller}</span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleContact(item)} style={{ fontSize: '10px', padding: '4px 10px' }}>
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
