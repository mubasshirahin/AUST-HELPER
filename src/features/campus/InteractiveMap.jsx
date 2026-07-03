import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Map, Navigation, Sparkles, Building2, ZoomIn, Maximize2, Minimize2,
  MapPin, Compass,
} from 'lucide-react';
import { campusFloors } from '../../data/mockData';
import GliderTabs from '../../components/GliderTabs';

const floorTabs = campusFloors.map((f) => ({
  id: f.floor,
  label: f.floor,
  icon: Building2,
  desc: f.mapImage ? 'Floor plan' : 'Room map',
  color: f.mapImage ? 'cyan' : 'blue',
}));

const zoomLevels = [
  { id: 'fit', label: 'Fit' },
  { id: '100', label: '100%' },
  { id: '125', label: '125%' },
  { id: '150', label: '150%' },
];

const roomTypeLabels = {
  admin: 'Administration',
  hall: 'Auditorium / Hall',
  facility: 'Facility',
  library: 'Library',
  classroom: 'Classroom',
  lab: 'Laboratory',
};

function GroundFloorShowcase({ floorData, selectedFloor }) {
  const [zoom, setZoom] = useState('fit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedRoomId, setHighlightedRoomId] = useState(null);
  const viewportRef = useRef(null);
  const hotspotRefs = useRef({});

  const toggleFullscreen = useCallback(async () => {
    const el = viewportRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightedRoomId(null);
  }, []);

  useEffect(() => {
    if (!highlightedRoomId) return undefined;

    const handlePointerDown = (event) => {
      if (event.target.closest('.floor-plan-location-item')) return;
      clearHighlight();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [highlightedRoomId, clearHighlight]);

  const handleLocationClick = useCallback((room) => {
    setHighlightedRoomId((prev) => {
      const next = prev === room.id ? null : room.id;
      if (next) {
        requestAnimationFrame(() => {
          const hotspotEl = hotspotRefs.current[room.id];
          if (hotspotEl && viewportRef.current) {
            hotspotEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        });
      }
      return next;
    });
  }, []);

  return (
    <div className="floor-plan-showcase animate-fadeInUp">
      <header className="floor-plan-hero">
        <div className="floor-plan-hero-bg" aria-hidden="true">
          <div className="floor-plan-orb floor-plan-orb-1" />
          <div className="floor-plan-orb floor-plan-orb-2" />
          <div className="floor-plan-grid" />
        </div>
        <div className="floor-plan-hero-content">
          <div className="floor-plan-badge">
            <Sparkles size={12} />
            <span>Official Campus Map</span>
          </div>
          <div className="floor-plan-hero-row">
            <div className="floor-plan-hero-icon">
              <Compass size={26} />
            </div>
            <div>
              <h2 className="floor-plan-title">{selectedFloor} Floor Plan</h2>
              <p className="floor-plan-subtitle">
                AUST ground floor — click Key Locations to highlight areas on the map.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="floor-plan-workspace">
        <div className="floor-plan-main">
          <div className="floor-plan-toolbar">
            <span className="floor-plan-toolbar-label">
              <ZoomIn size={14} />
              Zoom
            </span>
            <div className="floor-plan-zoom-group">
              {zoomLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`floor-plan-zoom-btn ${zoom === level.id ? 'active' : ''}`}
                  onClick={() => setZoom(level.id)}
                >
                  {level.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="floor-plan-fullscreen-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>

          <div
            ref={viewportRef}
            className={`floor-plan-viewport floor-plan-zoom-${zoom}`}
          >
            <div className="floor-plan-image-frame">
              <div
                className="floor-plan-image-wrap"
                onClick={clearHighlight}
                onKeyDown={(e) => { if (e.key === 'Escape') clearHighlight(); }}
                role="presentation"
              >
                <img
                  src={floorData.mapImage}
                  alt={`AUST ${selectedFloor} Floor Plan`}
                  className="floor-plan-image"
                  draggable={false}
                />
                {floorData.rooms.filter((room) => room.hotspot).map((room) => (
                  <div
                    key={room.id}
                    ref={(el) => { hotspotRefs.current[room.id] = el; }}
                    className={`floor-plan-hotspot floor-plan-hotspot-${room.type} ${highlightedRoomId === room.id ? 'active' : ''}`}
                    style={{
                      left: `${room.hotspot.left}%`,
                      top: `${room.hotspot.top}%`,
                      width: `${room.hotspot.width}%`,
                      height: `${room.hotspot.height}%`,
                    }}
                    aria-hidden={highlightedRoomId !== room.id}
                  >
                    {highlightedRoomId === room.id && (
                      <span className="floor-plan-hotspot-label">{room.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="floor-plan-hint">
              {highlightedRoomId
                ? 'Tap the same location again or click anywhere to clear'
                : 'Click a Key Location to glow it on the map · Scroll or pinch to explore'}
            </p>
          </div>
        </div>

        <aside className="floor-plan-sidebar">
          <div className="floor-plan-sidebar-card">
            <h3 className="floor-plan-sidebar-title">
              <MapPin size={16} />
              Key Locations
            </h3>
            <p className="floor-plan-sidebar-desc">Tap to highlight on the map</p>
            <ul className="floor-plan-location-list">
              {floorData.rooms.map((room) => (
                <li key={room.id}>
                  <button
                    type="button"
                    className={`floor-plan-location-item ${highlightedRoomId === room.id ? 'active' : ''}`}
                    onClick={() => handleLocationClick(room)}
                  >
                    <span className={`floor-plan-location-dot floor-plan-dot-${room.type}`} />
                    <div>
                      <span className="floor-plan-location-id">{room.id}</span>
                      <span className="floor-plan-location-name">{room.name}</span>
                      <span className="floor-plan-location-type">
                        {roomTypeLabels[room.type] || room.type}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="floor-plan-sidebar-card floor-plan-tips">
            <h3 className="floor-plan-sidebar-title">Quick Tips</h3>
            <ul className="floor-plan-tips-list">
              <li>Click same location again or anywhere to <strong>clear</strong> glow</li>
              <li>Use <strong>125%</strong> or <strong>150%</strong> to read labels clearly</li>
              <li>Tap <strong>Fullscreen</strong> for a bigger view</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function InteractiveMap() {
  const [selectedFloor, setSelectedFloor] = useState('Ground');
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const currentFloorData = campusFloors.find((f) => f.floor === selectedFloor) || campusFloors[0];
  const hasFloorPlan = Boolean(currentFloorData.mapImage);

  const getRoomColor = (type) => {
    switch (type) {
      case 'classroom': return 'var(--accent-blue)';
      case 'lab': return 'var(--accent-purple)';
      case 'admin': return 'var(--accent-amber)';
      case 'facility': return 'var(--accent-cyan)';
      case 'library': return 'var(--accent-emerald)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div className={`interactive-map-root ${hasFloorPlan ? 'interactive-map-root-plan' : ''}`}>
      <div className="interactive-map-header">
        <div className="interactive-map-heading">
          <div className="interactive-map-heading-icon">
            <Map size={20} />
          </div>
          <div>
            <h2 className="interactive-map-title">Floor Finder</h2>
            <p className="interactive-map-desc">
              Navigate AUST building floors — official plans & room layouts
            </p>
          </div>
        </div>
      </div>

      <GliderTabs
        tabs={floorTabs}
        activeTab={selectedFloor}
        onChange={(id) => {
          setSelectedFloor(id);
          setHoveredRoom(null);
        }}
        variant="dashboard"
      />

      {hasFloorPlan ? (
        <GroundFloorShowcase floorData={currentFloorData} selectedFloor={selectedFloor} />
      ) : (
        <div className="glass-card-static interactive-map-container animate-fadeInUp">
          <div className="grid-2" style={{ gridTemplateColumns: '2.2fr 0.8fr' }}>
            <div
              className="map-canvas-wrapper"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                height: '420px',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '9px', color: 'var(--text-tertiary)' }}>
                GRID COMPASS: NORTH WING
              </div>

              <svg style={{ width: '100%', height: '100%' }}>
                <rect x="10%" y="20%" width="80%" height="60%" fill="none" stroke="var(--border-secondary)" strokeWidth="2" strokeDasharray="4 4" rx="8" />
                <rect x="25%" y="40%" width="50%" height="20%" fill="none" stroke="var(--border-primary)" strokeWidth="1" />

                {currentFloorData.rooms.map((room) => (
                  <g
                    key={room.id}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => alert(`Navigating to: ${room.name} (${selectedFloor} floor)`)}
                  >
                    <circle
                      cx={`${room.x}%`}
                      cy={`${room.y}%`}
                      r="12"
                      fill={getRoomColor(room.type)}
                      opacity={hoveredRoom?.id === room.id ? 0.3 : 0.15}
                      style={{ transition: 'all 0.2s' }}
                    />
                    <circle cx={`${room.x}%`} cy={`${room.y}%`} r="6" fill={getRoomColor(room.type)} />
                    {hoveredRoom?.id === room.id && (
                      <text x={`${room.x}%`} y={`${room.y - 4}%`} textAnchor="middle" fill="var(--text-primary)" fontSize="10px" fontWeight="bold">
                        {room.id}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card-static map-legend-card">
                <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: '12px' }}>Floor Map Key</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)' }} /> Classrooms</div>
                  <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)' }} /> Labs</div>
                  <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)' }} /> Administration</div>
                  <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} /> Library Area</div>
                </div>
              </div>

              <div className="glass-card-static map-legend-card" style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: '8px' }}>Room Finder Details</h3>
                {hoveredRoom ? (
                  <div className="animate-fadeIn">
                    <span className="badge badge-blue" style={{ fontSize: '9px', marginBottom: '4px' }}>{hoveredRoom.id}</span>
                    <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)' }}>{hoveredRoom.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Category: <span style={{ textTransform: 'capitalize' }}>{hoveredRoom.type}</span>
                    </p>
                    <button
                      className="btn btn-primary btn-sm mt-4"
                      style={{ width: '100%', fontSize: '11px', display: 'flex', gap: '4px', justifyContent: 'center' }}
                      onClick={() => alert(`Starting virtual indoor navigation pathing to ${hoveredRoom.id}`)}
                    >
                      <Navigation size={12} /> Go There
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '16px 0', fontSize: '11px' }}>
                    Hover a pin on the map to inspect room details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
