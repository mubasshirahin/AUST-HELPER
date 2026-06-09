import React, { useState } from 'react';
import { Map, Pin, Navigation } from 'lucide-react';
import { campusFloors } from '../../data/mockData';

export default function InteractiveMap() {
  const [selectedFloor, setSelectedFloor] = useState('6th');
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const currentFloorData = campusFloors.find(f => f.floor === selectedFloor) || campusFloors[1];

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
    <div className="glass-card-static interactive-map-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <Map size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Interactive University Map</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Floor-by-floor classroom and lab location scanner</p>
          </div>
        </div>

        {/* Floor selection tabs */}
        <div className="flex gap-1" style={{ background: 'var(--bg-input)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
          {campusFloors.map(f => (
            <button 
              key={f.floor}
              onClick={() => setSelectedFloor(f.floor)}
              className={`btn btn-sm ${selectedFloor === f.floor ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px' }}
            >
              {f.floor}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2.2fr 0.8fr' }}>
        
        {/* SVG map layout simulation */}
        <div 
          style={{ 
            background: 'var(--bg-input)', 
            border: '1px solid var(--border-primary)', 
            borderRadius: 'var(--radius-xl)', 
            position: 'relative', 
            height: '350px',
            overflow: 'hidden'
          }}
        >
          {/* Compass grid simulation markings */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '9px', color: 'var(--text-tertiary)' }}>
            GRID COMPASS: NORTH WING
          </div>

          {/* SVG Map Container */}
          <svg style={{ width: '100%', height: '100%' }}>
            {/* Outline of building hallway */}
            <rect x="10%" y="20%" width="80%" height="60%" fill="none" stroke="var(--border-secondary)" strokeWidth="2" strokeDasharray="4 4" rx="8" />
            <rect x="25%" y="40%" width="50%" height="20%" fill="none" stroke="var(--border-primary)" strokeWidth="1" />
            
            {/* Interactive Pins on map coordinate items */}
            {currentFloorData.rooms.map(room => (
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
                <circle 
                  cx={`${room.x}%`} 
                  cy={`${room.y}%`} 
                  r="6" 
                  fill={getRoomColor(room.type)}
                />
                {hoveredRoom?.id === room.id && (
                  <text 
                    x={`${room.x}%`} 
                    y={`${room.y - 4}%`} 
                    textAnchor="middle" 
                    fill="var(--text-primary)" 
                    fontSize="10px" 
                    fontWeight="bold"
                    style={{ background: 'var(--bg-secondary)', padding: '2px' }}
                  >
                    {room.id}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend & Room lists */}
        <div style={{ display: 'flex', flexDirection: 'column', justify: 'between', gap: '16px' }}>
          
          <div className="glass-card-static" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', padding: '16px' }}>
            <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: '12px' }}>Floor Map Key</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)' }}></span> Classrooms</div>
              <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)' }}></span> Labs</div>
              <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)' }}></span> Administration</div>
              <div className="flex items-center gap-2"><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span> Library Area</div>
            </div>
          </div>

          <div className="glass-card-static" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', padding: '16px', flex: 1 }}>
            <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: '8px' }}>Room Finder Details</h3>
            {hoveredRoom ? (
              <div className="animate-fadeIn">
                <span className="badge badge-blue" style={{ fontSize: '9px', marginBottom: '4px' }}>{hoveredRoom.id}</span>
                <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)' }}>{hoveredRoom.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Category: <span style={{ textTransform: 'capitalize' }}>{hoveredRoom.type}</span></p>
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
                Hover a coordinate pin node on the map layout to inspect room titles.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
