import { DollarSign, Plus, ArrowUpDown } from 'lucide-react';
import './MoneyTrackerPage.css';

export default function MoneyTrackerPage() {
  return (
    <div className="mt-page animate-fadeIn">
      <header className="mt-hero">
        <div className="mt-hero-bg" aria-hidden="true">
          <div className="mt-hero-grid" />
          <div className="mt-hero-orb mt-hero-orb-1" />
          <div className="mt-hero-orb mt-hero-orb-2" />
          <div className="mt-hero-shimmer" />
        </div>
        <div className="mt-hero-content">
          <div className="mt-hero-title-row">
            <div className="mt-hero-icon">
              <DollarSign size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="mt-hero-title">
                <span className="mt-hero-name">Money Tracker</span>
              </h1>
              <p className="mt-hero-subtitle">Track your daily expenses, set budgets, and manage your student finances.</p>
            </div>
          </div>
        </div>
      </header>
      <div className="mt-placeholder">
        <DollarSign size={48} />
        <h3>Coming Soon</h3>
        <p>Expense tracking, budget goals, and monthly summaries.</p>
      </div>
    </div>
  );
}
