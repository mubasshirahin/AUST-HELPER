import React, { useState, useMemo } from 'react';
import { Coffee, Flame, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { canteenData } from '../../data/mockData';
import {
  getReviewSummary,
  getReviewsForFood,
  addReview,
  getComplaintsForFood,
  getComplaintCount,
  addComplaint,
} from '../../utils/canteenFeedbackStorage';

// Small read-only star row for showing an average rating.
function StarDisplay({ value, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          style={{
            color: n <= Math.round(value) ? 'var(--accent-amber)' : 'var(--text-tertiary)',
            fill: n <= Math.round(value) ? 'var(--accent-amber)' : 'none',
          }}
        />
      ))}
    </span>
  );
}

// Interactive star picker for the review form.
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={20}
          style={{
            cursor: 'pointer',
            color: n <= (hover || value) ? 'var(--accent-amber)' : 'var(--text-tertiary)',
            fill: n <= (hover || value) ? 'var(--accent-amber)' : 'none',
          }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        />
      ))}
    </span>
  );
}

// A single food card: price, average rating, and the feedback panel.
function FoodCard({ food }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  // Bump to force a re-read of feedback after a submit.
  const [feedbackVersion, setFeedbackVersion] = useState(0);

  const summary = useMemo(() => getReviewSummary(food.id), [food.id, feedbackVersion]);
  const complaintCount = useMemo(() => getComplaintCount(food.id), [food.id, feedbackVersion]);

  return (
    <div
      className="glass-card"
      style={{
        padding: '16px',
        background: 'var(--bg-input)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: food.available ? 1 : 0.5,
        position: 'relative'
      }}
    >
      {food.popular && (
        <span className="badge badge-amber" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '8px', display: 'flex', gap: '2px', alignItems: 'center' }}>
          <Flame size={8} /> BESTSELLER
        </span>
      )}

      <div>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>{food.category}</span>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0' }}>{food.name}</h3>

        {/* Average rating */}
        <div className="flex items-center gap-1" style={{ margin: '4px 0' }}>
          <StarDisplay value={summary.average} />
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
            {summary.count > 0 ? `${summary.average} (${summary.count})` : 'No ratings'}
          </span>
        </div>

        <p style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', color: 'var(--accent-cyan)', margin: '8px 0 0 0' }}>
          ৳ {food.price}
        </p>
      </div>

      <div className="flex justify-between items-center mt-6 pt-2" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px' }}>
        <span>
          {food.available ? (
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>In Stock</span>
          ) : (
            <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>Stock Out</span>
          )}
        </span>
      </div>

      {/* Review / complaint toggle */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setIsFeedbackOpen((open) => !open)}
        style={{ marginTop: '8px', fontSize: '10px', display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}
      >
        <MessageSquare size={11} />
        {isFeedbackOpen ? 'Hide feedback' : 'Review or complain'}
        {complaintCount > 0 && (
          <span className="badge badge-rose" style={{ fontSize: '8px', padding: '1px 4px' }}>{complaintCount}</span>
        )}
      </button>

      {isFeedbackOpen && (
        <FoodFeedback food={food} onChanged={() => setFeedbackVersion((v) => v + 1)} />
      )}
    </div>
  );
}

// The expandable review + complaint panel for a single food item.
function FoodFeedback({ food, onChanged }) {
  const [tab, setTab] = useState('reviews');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [error, setError] = useState('');

  const reviews = getReviewsForFood(food.id);
  const complaints = getComplaintsForFood(food.id);

  const submitReview = (e) => {
    e.preventDefault();
    try {
      addReview(food.id, rating, reviewText);
      setRating(0);
      setReviewText('');
      setError('');
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitComplaint = (e) => {
    e.preventDefault();
    try {
      addComplaint(food.id, complaintText);
      setComplaintText('');
      setError('');
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-secondary)', paddingTop: '10px' }}>
      {/* Tab switch */}
      <div className="flex gap-1 mb-3" style={{ background: 'var(--bg-card)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
        <button
          className={`btn btn-sm ${tab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '5px', fontSize: '10px', display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setTab('reviews')}
        >
          <MessageSquare size={11} /> Reviews ({reviews.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'complaints' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '5px', fontSize: '10px', display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setTab('complaints')}
        >
          <AlertTriangle size={11} /> Complaints ({complaints.length})
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--accent-rose)', fontSize: '10px', margin: '0 0 8px 0' }}>{error}</p>
      )}

      {tab === 'reviews' ? (
        <>
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
            <StarPicker value={rating} onChange={setRating} />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="input"
              placeholder="Share your thoughts on this item (optional)..."
              style={{ minHeight: '48px', resize: 'vertical', fontSize: '11px' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '11px' }}>
              Submit Review
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
            {reviews.length === 0 ? (
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
                No reviews yet. Be the first!
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                  <div className="flex justify-between items-center">
                    <StarDisplay value={r.rating} />
                    <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{r.dateLabel}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <form onSubmit={submitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="input"
              placeholder="Report an issue (quality, hygiene, wrong price...)"
              style={{ minHeight: '48px', resize: 'vertical', fontSize: '11px' }}
            />
            <button type="submit" className="btn btn-sm" style={{ fontSize: '11px', background: 'var(--accent-rose)', color: '#fff' }}>
              Submit Complaint
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
            {complaints.length === 0 ? (
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
                No complaints filed.
              </p>
            ) : (
              complaints.map((c) => (
                <div key={c.id} style={{ background: 'var(--accent-rose-glow)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-sm)', padding: '8px' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '9px', color: 'var(--accent-rose)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <AlertTriangle size={10} /> Complaint
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{c.dateLabel}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{c.text}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CanteenMenu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [canteenInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('aust-canteen-data');
      return stored ? JSON.parse(stored) : canteenData;
    } catch {
      return canteenData;
    }
  });

  const categories = useMemo(() => {
    const list = new Set(canteenInfo.menu ? canteenInfo.menu.map(item => item.category) : []);
    return ['All', ...Array.from(list)];
  }, [canteenInfo]);

  const filteredMenu = useMemo(() => {
    const menuList = canteenInfo.menu || [];
    return menuList.filter(item => {
      return activeCategory === 'All' || item.category === activeCategory;
    });
  }, [activeCategory, canteenInfo]);

  const isOpen = canteenInfo.status === 'open';

  return (
    <div className="glass-card-static canteen-menu-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-amber-glow)', color: 'var(--accent-amber)', padding: '6px', borderRadius: '8px' }}>
            <Coffee size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Canteen Food Menu & Crowd</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Check live crowd indices, timings, and popular menu choices</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Live occupancy/canteen status */}
          <div className="flex items-center gap-2" style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <span className={`badge ${isOpen ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          {isOpen && (
            <div className="flex items-center gap-2" style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Crowd Pulse:</span>
              <span style={{ fontWeight: 'bold', color: canteenInfo.crowdLevel >= 75 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {canteenInfo.crowdLevel}% ({canteenInfo.crowdLevel >= 75 ? 'Busy' : canteenInfo.crowdLevel >= 40 ? 'Moderate' : 'Quiet'})
              </span>
            </div>
          )}

          {categories.length > 1 && (
            <div className="flex gap-1" style={{ background: 'var(--bg-input)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '6px 12px' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food items Grid list */}
      {filteredMenu.length === 0 ? (
        <div className="glass-card-static" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
            {!isOpen ? 'The canteen is currently closed.' : 'No menu items available.'}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredMenu.map(food => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
