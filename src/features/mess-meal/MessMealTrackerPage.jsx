import { UtensilsCrossed } from 'lucide-react';
import './MessMealTrackerPage.css';

export default function MessMealTrackerPage() {
  return (
    <div className="mm-page animate-fadeIn">
      <header className="mm-hero">
        <div className="mm-hero-bg" aria-hidden="true">
          <div className="mm-hero-grid" />
          <div className="mm-hero-orb mm-hero-orb-1" />
          <div className="mm-hero-orb mm-hero-orb-2" />
          <div className="mm-hero-shimmer" />
        </div>
        <div className="mm-hero-content">
          <div className="mm-hero-title-row">
            <div className="mm-hero-icon">
              <UtensilsCrossed size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="mm-hero-title">
                <span className="mm-hero-name">Mess Meal Tracker</span>
              </h1>
              <p className="mm-hero-subtitle">Track your mess meals, plan your weekly menu, and split costs with roommates.</p>
            </div>
          </div>
        </div>
      </header>
      <div className="mm-placeholder">
        <UtensilsCrossed size={48} />
        <h3>Coming Soon</h3>
        <p>Meal logging, weekly menu planner, and cost splitting.</p>
      </div>
    </div>
  );
}
