import React, { useMemo, useState, useEffect } from 'react';
import ResultTable from './ResultTable';
import { formatSemesterLabel } from '../../utils/semester';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';
import { getUserStorageItem, getCurrentUserId } from '../../utils/authStorage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const storageKeyType = 'semesterResults';

const getCreditValue = (credit) => Number(credit) || 0;

export default function CGPAGraph() {
  const [resultsVersion, setResultsVersion] = useState(0);
  const [userResults, setUserResults] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is guest
    const userId = getCurrentUserId();
    setIsGuest(!userId);

    // Load user-specific results (only returns data for authenticated users)
    const stored = getUserStorageItem(storageKeyType);
    setUserResults(stored);
  }, [resultsVersion]);

  const results = useMemo(() => {
    // For guest users, show empty data (no mock data)
    // For authenticated users, show their data or empty if none saved
    if (isGuest) return [];
    return userResults || [];
  }, [userResults, isGuest]);
  const completedSemesters = useMemo(() => {
    return results.filter(r => r.sgpa !== null);
  }, [results]);

  const chartData = useMemo(() => {
    const labels = completedSemesters.map((r) => formatSemesterLabel(r.semester));
    const sgpaList = completedSemesters.map(r => r.sgpa);
    const cgpaList = completedSemesters.map(r => r.cgpa);

    return {
      labels,
      datasets: [
        {
          label: 'SGPA',
          data: sgpaList,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: 'rgba(6,182,212,0.4)',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'CGPA',
          data: cgpaList,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.10)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: 'rgba(245,158,11,0.35)',
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };
  }, [completedSemesters]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 13, 13, 0.97)',
        titleColor: '#f59e0b',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(245, 158, 11, 0.25)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 10,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      y: {
        min: 2.0,
        max: 4.0,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { 
          color: 'var(--text-secondary)',
          stepSize: 0.25
        }
      }
    }
  };

  const bestSem = useMemo(() => {
    if (completedSemesters.length === 0) return { sem: '-', gpa: 0 };
    let best = completedSemesters[0];
    completedSemesters.forEach(s => {
      if (s.sgpa > best.sgpa) best = s;
    });
    return { sem: formatSemesterLabel(best.semester), gpa: best.sgpa };
  }, [completedSemesters]);

  const currentCgpa = completedSemesters.at(-1)?.cgpa ?? null;
  const creditsCompleted = completedSemesters.reduce((total, sem) => {
    return total + sem.courses.reduce((sum, course) => {
      return course.point !== null ? sum + getCreditValue(course.credit) : sum;
    }, 0);
  }, 0);

  return (
    <div className="cgpagraph-container stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {completedSemesters.length === 0 && (
        <div className="glass-card-static animate-fadeInUp">
          <div className="empty-state">
            <TrendingUp size={42} />
            <h3>No grade data yet</h3>
            <p>Add your semester results below to build your CGPA Bol.</p>
          </div>
        </div>
      )}

      {completedSemesters.length > 0 && (
        <>
      {/* Visual Analytics Info Cards */}
      <div className="grid-3">
        <div className="cgpa-summary-card">
          <div className="flex justify-between items-center">
            <span className="stat-label" style={{fontSize:'var(--fs-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-tertiary)',fontWeight:'var(--fw-semibold)'}}>Current CGPA</span>
            <TrendingUp size={16} style={{ color: 'var(--accent-amber)', opacity: 0.85 }} />
          </div>
          <span className="stat-value cgpa-summary-value" style={{ color: 'var(--accent-amber)' }}>{currentCgpa?.toFixed(2)}</span>
        </div>

        <div className="cgpa-summary-card">
          <div className="flex justify-between items-center">
            <span className="stat-label" style={{fontSize:'var(--fs-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-tertiary)',fontWeight:'var(--fw-semibold)'}}>Best Semester</span>
            <Award size={16} style={{ color: 'var(--accent-blue)', opacity: 0.85 }} />
          </div>
          <span className="stat-value cgpa-summary-value" style={{ color: 'var(--accent-blue)' }}>{bestSem.gpa}</span>
          <span className="stat-change cgpa-summary-sub" style={{ color: 'var(--text-secondary)' }}>{bestSem.sem}</span>
        </div>

        <div className="cgpa-summary-card">
          <div className="flex justify-between items-center">
            <span className="stat-label" style={{fontSize:'var(--fs-xs)',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-tertiary)',fontWeight:'var(--fw-semibold)'}}>Credits Completed</span>
            <CheckCircle size={16} style={{ color: 'var(--accent-emerald)', opacity: 0.85 }} />
          </div>
          <span className="stat-value cgpa-summary-value" style={{ color: 'var(--accent-emerald)' }}>{creditsCompleted.toFixed(1)}</span>
        </div>
      </div>

      {/* CGPA Chart */}
      <div className="glass-card-static" style={{ 
        height: '350px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)', marginBottom: '16px', letterSpacing: '-0.01em' }}>Academic Progression Trend</h3>
        <div style={{ height: '280px', position: 'relative' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
        </>
      )}

      <ResultTable onResultsChange={() => setResultsVersion((version) => version + 1)} />
    </div>
  );
}
