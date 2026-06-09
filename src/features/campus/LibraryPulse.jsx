import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Activity, BellRing, VolumeX } from 'lucide-react';
import { libraryData } from '../../data/mockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend
);

export default function LibraryPulse() {
  const [libState] = useState(() => {
    try {
      const stored = localStorage.getItem('aust-library-data');
      return stored ? JSON.parse(stored) : libraryData;
    } catch {
      return libraryData;
    }
  });

  const chartData = {
    labels: libState.peakHours ? libState.peakHours.map(item => item.hour) : [],
    datasets: [
      {
        label: 'Occupancy %',
        data: libState.peakHours ? libState.peakHours.map(item => item.occupancy) : [],
        backgroundColor: '#6391ff',
        borderRadius: 4,
        hoverBackgroundColor: '#22d3ee',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } },
      y: { max: 100, ticks: { color: 'var(--text-secondary)', stepSize: 20 } }
    }
  };

  const totalSeats = libState.totalSeats || 120;
  const occupied = libState.occupied || 0;
  const occupancyPercentage = totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0;

  return (
    <div className="glass-card-static library-pulse-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="icon" style={{ backgroundColor: 'var(--accent-blue-glow)', color: 'var(--accent-blue)', padding: '6px', borderRadius: '8px' }}>
            <Activity size={18} />
          </div>
          <div>
            <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Library Occupancy Pulse</h2>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Real-time library zones crowd levels and noise alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ background: 'var(--bg-input)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Occupancy:</span>
          <span style={{ fontWeight: 'bold', fontSize: 'var(--fs-sm)', color: 'var(--accent-blue)' }}>
            {occupancyPercentage}%
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>({occupied}/{totalSeats} seats)</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Side: Zones list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {libState.zones && libState.zones.map(zone => {
            const pct = zone.seats > 0 ? Math.round((zone.occupied / zone.seats) * 100) : 0;
            
            return (
              <div 
                key={zone.name}
                className="p-4"
                style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold' }}>{zone.name}</h4>
                  
                  <div className="flex items-center gap-2">
                    {zone.noise === 'quiet' ? (
                      <span className="badge badge-emerald" style={{ fontSize: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <VolumeX size={10} /> QUIET
                      </span>
                    ) : (
                      <span className="badge badge-amber" style={{ fontSize: '8px' }}>MODERATE</span>
                    )}

                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{zone.occupied}/{zone.seats} seats</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--accent-rose)' : 'var(--accent-blue)' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '28px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Hourly Occupancy Chart */}
        <div className="glass-card-static" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '12px' }}>Hourly Peak Tracker</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
