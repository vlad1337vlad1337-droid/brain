
import React from 'react';

interface ProgressRingProps {
  progress: number;
  stroke?: number;
  radius?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress, stroke = 8, radius = 50 }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="-rotate-90"
    >
      <circle
        className="text-zinc-200 dark:text-zinc-700"
        stroke="currentColor"
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="currentColor"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeWidth={stroke}
        fill="transparent"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeLinecap="round"
        className="text-violet-500 dark:text-violet-400 transition-all duration-500 ease-in-out"
      />
       <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        className="text-xl font-bold fill-current text-zinc-700 dark:text-zinc-200 rotate-90 origin-center"
      >
        {`${Math.round(progress)}%`}
      </text>
    </svg>
  );
};
