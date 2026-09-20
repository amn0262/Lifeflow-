import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className = '',
  accentColor = 'text-indigo-600 dark:text-indigo-400',
}) => {
  return (
    <div
      className={`relative bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
            {value}
          </h4>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-semibold ${
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">vs last week</span>
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 ${accentColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
