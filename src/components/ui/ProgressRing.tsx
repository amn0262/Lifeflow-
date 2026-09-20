import React from 'react';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  className?: string;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 110,
  strokeWidth = 9,
  strokeColor = '#6366f1', // indigo-500
  className = '',
  label,
  sublabel,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
          {label ?? `${normalizedProgress}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
