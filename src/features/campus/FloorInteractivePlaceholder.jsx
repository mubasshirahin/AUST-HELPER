import { MapPin, Construction } from 'lucide-react';

export default function FloorInteractivePlaceholder({ floor }) {
  return (
    <div className="ground-interactive-card">
      <div className="ground-interactive-header">
        <div>
          <div className="ground-interactive-eyebrow">Interactive Campus Plan</div>
          <h3>AUST CAMPUS — {floor} Floor</h3>
        </div>
      </div>

      <div className="ground-interactive-map-frame" style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8dcc8, #f2ead8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 20px rgba(60,45,20,0.10)',
          }}>
            <Construction size={34} color="#9c8355" />
          </div>
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '18px', fontWeight: 'bold', color: '#5a3e1b', marginBottom: '8px',
          }}>
            Interactive Map Coming Soon
          </div>
          <p style={{ fontSize: '13px', color: '#8b7355', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
            The interactive floor plan for the {floor} floor is being designed.
            Switch to <strong>Image</strong> view to explore with hotspots.
          </p>
          <div style={{
            display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px',
            flexWrap: 'wrap',
          }}>
            {['Classrooms', 'Labs', 'Facilities', 'Washrooms'].map((label) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', color: '#6b5e45', background: '#f7f1e3',
                border: '1px solid #e7ddc4', borderRadius: '8px', padding: '5px 10px',
              }}>
                <MapPin size={11} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="ground-interactive-footer">
        Switch to <strong>Image</strong> view for hotspot-based navigation
      </div>
    </div>
  );
}
