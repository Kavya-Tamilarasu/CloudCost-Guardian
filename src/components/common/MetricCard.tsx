import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string;
  description: string;
  trend?: {
    value: string;
    isPositive: boolean; // positive savings vs positive cost
    label: string;
  };
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = 'default',
}) => {
  const iconColors: Record<string, string> = {
    default: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
    danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
  };

  return (
    <div
      id={id}
      className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase leading-snug">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border shrink-0 ${iconColors[variant] || iconColors.default}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 leading-snug">
          {description}
        </span>
        {trend && (
          <span
            className={`font-semibold flex items-center gap-1 ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {trend.value}
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">{trend.label}</span>
          </span>
        )}
      </div>
    </div>
  );
};
