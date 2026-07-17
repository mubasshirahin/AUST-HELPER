import { AlarmClock, BellRing, CalendarClock } from 'lucide-react';
import './AutoAlarmPage.css';

export default function AutoAlarmPage() {
  return (
    <div className="aa-page animate-fadeIn">
      <header className="aa-hero">
        <div className="aa-hero-bg" aria-hidden="true">
          <div className="aa-hero-grid" />
          <div className="aa-hero-orb aa-hero-orb-1" />
          <div className="aa-hero-orb aa-hero-orb-2" />
          <div className="aa-hero-shimmer" />
        </div>
        <div className="aa-hero-content">
          <div className="aa-hero-title-row">
            <div className="aa-hero-icon">
              <AlarmClock size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="aa-hero-title">
                <span className="aa-hero-name">Auto Alarm Setter</span>
              </h1>
              <p className="aa-hero-subtitle">
                Automatically set alarms based on your class routine — never miss a lecture again.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="aa-coming-soon">
        <div className="aa-cs-card">
          <BellRing size={32} strokeWidth={1.5} />
          <h2>Smart Alarms — Coming Soon</h2>
          <p>Link your class routine and we'll automatically set alarms before each class. Customise buffer time, snooze preferences, and get wake-up alarms for morning lectures.</p>
          <div className="aa-feature-pills">
            <span><CalendarClock size={14} /> Routine Sync</span>
            <span><AlarmClock size={14} /> Custom Buffer</span>
            <span><BellRing size={14} /> Smart Snooze</span>
          </div>
        </div>
      </div>
    </div>
  );
}
