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
import { TrendingUp, Award, CheckCircle, ChartLine, Sparkles } from 'lucide-react';
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
          borderColor: '#2dd4bf',
          backgroundColor: (ctx) => {
            if (!ctx.chart?.ctx) return 'rgba(45, 212, 191, 0.08)';
            const chartArea = ctx.chart.chartArea;
            if (!chartArea) return 'rgba(45, 212, 191, 0.08)';
            const gradient = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(45, 212, 191, 0.25)');
            gradient.addColorStop(1, 'rgba(45, 212, 191, 0.01)');
            return gradient;
          },
          tension: 0.35,
          borderWidth: 3,
          borderDash: [6, 3],
          pointBackgroundColor: '#2dd4bf',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#2dd4bf',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'CGPA',
          data: cgpaList,
          borderColor: '#fbbf24',
          backgroundColor: (ctx) => {
            if (!ctx.chart?.ctx) return 'rgba(251, 191, 36, 0.10)';
            const chartArea = ctx.chart.chartArea;
            if (!chartArea) return 'rgba(251, 191, 36, 0.10)';
            const gradient = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(251, 191, 36, 0.30)');
            gradient.addColorStop(1, 'rgba(251, 191, 36, 0.01)');
            return gradient;
          },
          fill: true,
          tension: 0.35,
          borderWidth: 3.5,
          pointBackgroundColor: '#fbbf24',
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#fbbf24',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3.5,
        }
      ]
    };
  }, [completedSemesters]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          color: '#ffffff',
          font: { family: 'Inter', size: 13, weight: '600' },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        titleColor: '#ffffff',
        titleFont: { size: 14, weight: 'bold', family: 'Inter' },
        bodyColor: '#ffffff',
        bodyFont: { size: 13, family: 'Inter' },
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1.5,
        padding: 16,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
            };
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawTicks: false
        },
        ticks: { 
          color: '#ffffff',
          font: { size: 11, weight: '500', family: 'Inter' },
          padding: 8
        },
        border: {
          color: 'rgba(255,255,255,0.10)'
        }
      },
      y: {
        min: 2.0,
        max: 4.0,
        grid: { 
          color: 'rgba(255,255,255,0.08)',
          drawTicks: false
        },
        ticks: { 
          color: '#ffffff',
          font: { size: 11, weight: '500', family: 'Inter' },
          stepSize: 0.25,
          padding: 8,
          callback: (value) => value.toFixed(2)
        },
        border: {
          color: 'rgba(255,255,255,0.10)'
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

      {/* CGPA Chart Card */}
      <div className="cgpa-chart-card">
        <div className="cgpa-chart-header">
          <div className="cgpa-chart-header-left">
            <div className="cgpa-chart-icon">
              <ChartLine size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="cgpa-chart-title">Academic Progression Trend</h3>
              <p className="cgpa-chart-subtitle">SGPA &amp; CGPA across semesters</p>
            </div>
          </div>
          <div className="cgpa-chart-badge">
            <Sparkles size={12} strokeWidth={2.5} />
            <span>Live</span>
          </div>
        </div>
        <div className="cgpa-chart-body">
          <Line data={chartData} options={options} />
        </div>
      </div>
        </>
      )}

      <ResultTable onResultsChange={() => setResultsVersion((version) => version + 1)} />
    </div>
  );
}
