import React from 'react';
import { Building2, GraduationCap, Users, Library, Check } from 'lucide-react';

const steps = [
  { id: 'dept', label: 'Department', icon: Building2 },
  { id: 'sem', label: 'Semester', icon: GraduationCap },
  { id: 'batch', label: 'Batch', icon: Users },
  { id: 'ready', label: 'Materials', icon: Library },
];

export default function VaultStepProgress({ currentStep }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="vault-step-progress">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`vault-step-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="vault-step-dot">
                {isDone ? <Check size={14} /> : <Icon size={14} />}
              </span>
              <span className="vault-step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`vault-step-line ${index < currentIndex ? 'filled' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
