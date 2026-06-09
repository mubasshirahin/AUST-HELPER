import React, { useState } from 'react';
import { Home, Plus, MapPin, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  addToLetListing,
  copyContact,
  formatPostedDate,
  getSellerLabel,
  listToLetListings,
  setToLetAvailability,
} from '../../utils/marketplaceStorage';

const spaceTypes = ['Seat', 'Room', 'Flat', 'Hostel'];
const amenityOptions = ['WiFi', 'AC', 'Kitchen', 'Mess', 'Security', 'Attached Bath', 'Furnished', 'Lift'];

const defaultForm = {
  title: '',
  rent: '',
  location: '',
  type: 'Seat',
  amenities: ['WiFi'],
  contact: '',
};

export default function ToLetListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState(() => listToLetListings());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm, contact: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = () => setListings(listToLetListings());

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      addToLetListing({ ...form, owner: getSellerLabel(user) });
      setForm({ ...defaultForm, contact: form.contact });
      setShowForm(false);
      refresh();
      setMessage('To-let listing published.');
    } catch (submitError) {
      setError(submitError.message || 'Could not publish listing.');
    }
  };

  const handleContact = async (listing) => {
    try {
      const result = await copyContact(listing.contact, 'Owner contact');
      setMessage(result);
      setError('');
    } catch (contactError) {
      setError(contactError.message || 'Could not copy contact.');
    }
  };

  const handleToggleAvailable = (listing) => {
    setToLetAvailability(listing.id, !listing.available);
    refresh();
    setMessage(listing.available ? 'Marked as occupied.' : 'Marked as available.');
  };

  return (
    <div className="glass-card-static tolet-listings-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', padding: '6px', borderRadius: '8px' }}>
            <Home size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>AUST To-Let Services</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Student-posted seats, rooms, and flats near campus</p>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm((open) => !open)}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Close' : 'Post To-Let'}
        </button>
      </div>

      {message && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-emerald)', marginBottom: '10px' }}>{message}</p>}
      {error && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)', marginBottom: '10px' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Listing title
            <input className="input" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} required />
          </label>
          <div className="grid-3" style={{ gap: '10px' }}>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Monthly rent (৳)
              <input className="input" type="number" min="0" value={form.rent} onChange={(e) => setForm((c) => ({ ...c, rent: e.target.value }))} required />
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Location
              <input className="input" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="Tejgaon" required />
            </label>
            <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              Type
              <select className="input" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}>
                {spaceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>
          <div>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Amenities</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  className={`badge ${form.amenities.includes(amenity) ? 'badge-blue' : 'badge-blue'}`}
                  style={{ cursor: 'pointer', opacity: form.amenities.includes(amenity) ? 1 : 0.45 }}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
          <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Contact
            <input className="input" value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} required />
          </label>
          <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Publish listing</button>
        </form>
      )}

      {listings.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px' }}>
          <Home size={36} />
          <h3>No to-let posts yet</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Post a seat or flat for students looking near AUST.</p>
        </div>
      ) : (
        <div className="grid-3">
          {listings.map((lst) => (
            <div
              key={lst.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                opacity: lst.available ? 1 : 0.6,
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="badge badge-purple" style={{ fontSize: '9px' }}>{lst.type} Space</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{formatPostedDate(lst.postedAt)}</span>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '6px 0 2px 0' }}>{lst.title}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
                  <MapPin size={10} /> {lst.location}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{lst.owner}</p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {lst.amenities.map((am) => (
                    <span key={am} className="badge badge-blue" style={{ fontSize: '8px', padding: '1px 4px' }}>{am}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'block' }}>Monthly Rent</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>৳ {lst.rent}</span>
                </div>

                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleToggleAvailable(lst)} style={{ fontSize: '10px', padding: '4px 8px' }}>
                    {lst.available ? 'Mark Full' : 'Reopen'}
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={!lst.available} onClick={() => handleContact(lst)} style={{ fontSize: '10px', padding: '4px 10px' }}>
                    {lst.available ? 'Contact' : 'Occupied'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
