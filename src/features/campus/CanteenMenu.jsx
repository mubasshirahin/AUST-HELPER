import React, { useState, useMemo } from 'react';
import { Coffee, Flame, AlertCircle } from 'lucide-react';
import { canteenData } from '../../data/mockData';

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
            <div 
              key={food.id}
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

                <button 
                  className="btn btn-secondary btn-sm"
                  disabled={!food.available}
                  onClick={() => alert(`Pre-order placed for: ${food.name}. Claim tokens at cash counter.`)}
                >
                  Preorder Tokens
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
