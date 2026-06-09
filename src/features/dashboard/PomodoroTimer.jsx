import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee } from 'lucide-react';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [triggerFlash, setTriggerFlash] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            
            // Audio simulation
            setTriggerFlash(true);
            setTimeout(() => setTriggerFlash(false), 2000);

            if (!isBreak) {
              // Work finished
              setIsBreak(true);
              setTimeLeft(5 * 60); // 5 min break
              setSessionsCompleted(s => s + 1);
            } else {
              // Break finished
              setIsBreak(false);
              setTimeLeft(25 * 60); // 25 min work
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isBreak]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate SVG circular stroke offset
  const maxTime = isBreak ? 5 * 60 : 25 * 60;
  const strokeDashoffset = 283 - (283 * timeLeft) / maxTime;

  return (
    <div 
      className="glass-card-static pomodoro-timer animate-fadeInUp"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        outline: triggerFlash ? '2px solid var(--accent-rose)' : 'none',
        boxShadow: triggerFlash ? 'var(--shadow-glow-rose)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="flex items-center gap-1.5 mb-2" style={{ color: isBreak ? 'var(--accent-emerald)' : 'var(--accent-blue)', fontSize: 'var(--fs-xs)', fontWeight: 'bold' }}>
        {isBreak ? (
          <>
            <Coffee size={14} /> <span>BREAK</span>
          </>
        ) : (
          <>
            <Brain size={14} /> <span>FOCUS</span>
          </>
        )}
      </div>

      {/* SVG Ring Timer */}
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '8px 0' }}>
        <svg style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="var(--bg-input)" 
            strokeWidth="5" 
            fill="transparent" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke={isBreak ? 'var(--accent-emerald)' : 'var(--accent-blue)'} 
            strokeWidth="5" 
            fill="transparent" 
            strokeDasharray="283" 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'var(--fs-md)',
            fontWeight: 'var(--fw-bold)',
            fontFamily: 'monospace'
          }}
        >
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center mb-2">
        <button 
          className="btn btn-secondary btn-icon" 
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          onClick={handleStartPause}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button 
          className="btn btn-secondary btn-icon" 
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          onClick={handleReset}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
        Sessions: {sessionsCompleted}
      </span>
    </div>
  );
}
