import { DoorOpen, Search, MapPin } from 'lucide-react';
import './EmptyClassroomPage.css';

export default function EmptyClassroomPage() {
  return (
    <div className="ecf-page animate-fadeIn">
      <header className="ecf-hero">
        <div className="ecf-hero-bg" aria-hidden="true">
          <div className="ecf-hero-grid" />
          <div className="ecf-hero-orb ecf-hero-orb-1" />
          <div className="ecf-hero-orb ecf-hero-orb-2" />
          <div className="ecf-hero-shimmer" />
        </div>
        <div className="ecf-hero-content">
          <div className="ecf-hero-title-row">
            <div className="ecf-hero-icon">
              <DoorOpen size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="ecf-hero-title">
                <span className="ecf-hero-name">Empty Classroom Finder</span>
              </h1>
              <p className="ecf-hero-subtitle">
                Find available classrooms for self-study, group work, or extra practice.
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="ecf-coming-soon">
        <div className="ecf-cs-card">
          <Search size={32} strokeWidth={1.5} />
          <h2>Classroom Finder — Coming Soon</h2>
          <p>See real-time availability of all classrooms across campus. Filter by building, floor, capacity, and time slot to find the perfect spot.</p>
          <div className="ecf-feature-pills">
            <span><DoorOpen size={14} /> Real-Time Availability</span>
            <span><MapPin size={14} /> Floor Maps</span>
            <span><Search size={14} /> Capacity Filter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
