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
          borderColor: '#8f8675',
          backgroundColor: 'rgba(143, 134, 117, 0.12)',
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: '#8f8675',
          pointRadius: 4,
        },
        {
          label: 'CGPA',
          data: cgpaList,
          borderColor: '#b0975d',
          backgroundColor: 'rgba(176, 151, 93, 0.16)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointBackgroundColor: '#b0975d',
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#f3f4f6',
        borderColor: 'var(--border-primary)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      x: {
        grid: { color: 'var(--border-secondary)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      y: {
        min: 2.0,
        max: 4.0,
        grid: { color: 'var(--border-secondary)' },
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
            <p>Add your semester results below to build your CGPA tracker.</p>
          </div>
        </div>
      )}

      {completedSemesters.length > 0 && (
        <>
      {/* Visual Analytics Info Cards */}
      <div className="grid-3">
        <div className="glass-card stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Current CGPA</span>
            <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>{currentCgpa?.toFixed(2)}</span>
          <span className="stat-change positive">From saved transcript</span>
        </div>

        <div className="glass-card stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Best Semester Result</span>
            <Award size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <span className="stat-value" style={{ color: 'var(--accent-purple)' }}>{bestSem.gpa}</span>
          <span className="stat-change" style={{ color: 'var(--text-secondary)' }}>{bestSem.sem}</span>
        </div>

        <div className="glass-card stat-card">
          <div className="flex justify-between items-center">
            <span className="stat-label">Credits Completed</span>
            <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>{creditsCompleted.toFixed(1)}</span>
          <span className="stat-change positive">Graded credits</span>
        </div>
      </div>

      {/* CGPA Chart */}
      <div className="glass-card-static" style={{ height: '350px' }}>
        <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'var(--fw-bold)', marginBottom: '16px' }}>Academic Progression Trend</h3>
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
