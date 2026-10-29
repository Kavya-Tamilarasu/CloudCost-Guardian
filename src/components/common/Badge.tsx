import React from 'react';
import { SeverityLevel, WasteCategory, ResourceStatus } from '../../types/cloud';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const styles: Record<SeverityLevel, string> = {
    Critical: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
    High: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border border-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
    Info: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap tracking-wide ${styles[severity] || styles.Info} ${className}`}
    >
      {severity}
    </span>
  );
};

interface StatusBadgeProps {
  status: ResourceStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();
  let color = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';

  if (normalized === 'running' || normalized === 'active' || normalized === 'in-use') {
    color = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  } else if (normalized === 'unattached' || normalized === 'unassociated') {
    color = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
  } else if (normalized === 'stopped') {
    color = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  } else if (normalized === 'available') {
    color = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize whitespace-nowrap ${color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
};

interface WasteBadgeProps {
  category: WasteCategory;
  className?: string;
}

export const WasteBadge: React.FC<WasteBadgeProps> = ({ category, className = '' }) => {
  if (category === 'Healthy') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap ${className}`}
      >
        Healthy
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 whitespace-nowrap ${className}`}
    >
      {category}
    </span>
  );
};
