import React from 'react';

export interface RadialProgressProps {
  /** Percentage value between 0 and 100 */
  value: number;
  /** Size in pixels (width and height). Defaults to 52 */
  size?: number;
  /** Stroke thickness in pixels. Defaults to 4.5 */
  strokeWidth?: number;
  /** Color of the progress arc. If not specified, dynamically uses #10B981 at 100% and #00BFEA below 100% */
  color?: string;
  /** Background track stroke color. Defaults to slate-800 (#1e293b) */
  trackColor?: string;
  /** Whether to display the percentage number in the center. Defaults to true */
  showValue?: boolean;
  /** Optional custom text or icon in the center */
  customCenterContent?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Optional secondary subtitle text beneath or alongside */
  subtext?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  size = 52,
  strokeWidth = 4.5,
  color,
  trackColor = '#1e293b',
  showValue = true,
  customCenterContent,
  className = '',
  subtext,
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Dynamic color based on completion: Emerald for 100%, Cyan for active progress
  const strokeColor = color || (clampedValue === 100 ? '#10B981' : '#00BFEA');

  return (
    <div
      className={`inline-flex flex-col items-center justify-center relative select-none ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clampedValue}%`}
    >
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ overflow: 'visible' }}
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-colors"
          />

          {/* Foreground Animated Progress Circle */}
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
            style={{
              filter: clampedValue > 0 ? `drop-shadow(0 0 3px ${strokeColor}40)` : undefined,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          {customCenterContent ? (
            customCenterContent
          ) : showValue ? (
            <span
              className="font-mono font-bold text-white tabular-nums tracking-tighter"
              style={{ fontSize: Math.max(10, Math.round(size * 0.26)) }}
            >
              {clampedValue}
              <span className="text-[9px] font-normal text-slate-400">%</span>
            </span>
          ) : null}
        </div>
      </div>

      {subtext && (
        <span className="text-[10px] text-slate-400 font-mono mt-1 text-center">
          {subtext}
        </span>
      )}
    </div>
  );
};
