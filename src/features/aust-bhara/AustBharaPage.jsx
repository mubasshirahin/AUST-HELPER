import { Banknote, CreditCard, Receipt } from 'lucide-react';
import './AustBharaPage.css';

export default function AustBharaPage() {
  return (
    <div className="aust-bhara-page animate-fadeIn">
      <header className="ab-hero">
        <div className="ab-hero-bg" aria-hidden="true">
          <div className="ab-hero-grid" />
          <div className="ab-hero-orb ab-hero-orb-1" />
          <div className="ab-hero-orb ab-hero-orb-2" />
          <div className="ab-hero-shimmer" />
        </div>
        <div className="ab-hero-content">
          <div className="ab-hero-title-row">
            <div className="ab-hero-icon">
              <Banknote size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="ab-hero-title">
                <span className="ab-hero-name">Aust Bhara</span>
              </h1>
              <p className="ab-hero-subtitle">
                Track your semester fees, tuition, and all AUST-related payments in one place.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="ab-coming-soon">
        <div className="ab-cs-card">
          <Receipt size={32} strokeWidth={1.5} />
          <h2>Fee Tracker — Coming Soon</h2>
          <p>View semester-wise fee breakdowns, track payment deadlines, and get reminders before due dates. All your AUST payment history in one clean dashboard.</p>
          <div className="ab-feature-pills">
            <span><CreditCard size={14} /> Semester Fees</span>
            <span><Banknote size={14} /> Exam Fees</span>
            <span><Receipt size={14} /> Payment History</span>
          </div>
        </div>
      </div>
    </div>
  );
}
