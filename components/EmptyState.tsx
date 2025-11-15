
import React from 'react';

type IllustrationType = 'all-done' | 'no-tasks' | 'ideas' | 'overdue' | 'completed' | 'journal' | 'calendar';

interface EmptyStateProps {
  illustration: IllustrationType;
  message: string;
}

const illustrations: Record<IllustrationType, React.ReactNode> = {
    'all-done': (
        <svg viewBox="0 0 200 150" className="w-48 h-auto">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M60 90 C 80 120, 120 120, 140 90" strokeWidth="3" className="text-zinc-300 dark:text-zinc-600" />
            <circle cx="80" cy="70" r="8" className="text-zinc-400 dark:text-zinc-500" />
            <circle cx="120" cy="70" r="8" className="text-zinc-400 dark:text-zinc-500" />
            <path d="M70 75 Q 80 85, 90 75" className="text-zinc-400 dark:text-zinc-500" />
            <path d="M110 75 Q 120 85, 130 75" className="text-zinc-400 dark:text-zinc-500" />
            <path d="M30 110 H 170" className="text-zinc-200 dark:text-zinc-700" />
            <path d="M40,110 Q50,90 60,110 T80,110" strokeDasharray="4" className="text-violet-400 opacity-50" />
             <path d="M120,110 Q130,90 140,110 T160,110" strokeDasharray="4" className="text-green-400 opacity-50" />
          </g>
        </svg>
    ),
    'no-tasks': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
           <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <rect x="50" y="40" width="100" height="80" rx="10" className="text-zinc-300 dark:text-zinc-600" />
             <line x1="65" y1="60" x2="135" y2="60" className="text-zinc-400 dark:text-zinc-500" />
             <line x1="65" y1="80" x2="115" y2="80" className="text-zinc-400 dark:text-zinc-500" />
             <line x1="65" y1="100" x2="135" y2="100" className="text-zinc-400 dark:text-zinc-500" />
             <path d="M130 115 l 20 20 l 30 -30" strokeWidth="4" className="text-green-500" />
           </g>
        </svg>
    ),
     'ideas': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
             <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M90,40 C40,40 40,100 90,100 S140,100 140,70 S110,40 90,40 Z" className="text-yellow-400/50 fill-yellow-400/20" />
                <path d="M100,100 V 120" />
                <path d="M85,120 H 115" />
                <path d="M90,45 C95,35 105,35 110,45" />
             </g>
        </svg>
    ),
    'overdue': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="100" cy="80" r="40" className="text-zinc-300 dark:text-zinc-600" />
            <line x1="100" y1="60" x2="100" y2="85" />
            <circle cx="100" cy="100" r="2" fill="currentColor" />
            <path d="M140 80 A 40 40 0 1 1 100 40" strokeDasharray="5" className="text-red-500" />
            <path d="M100 40 L 105 35 M 100 40 L 95 35" className="text-red-500" />
          </g>
        </svg>
    ),
    'completed': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M60 40 H 140 V 120 H 60 Z" className="text-zinc-300 dark:text-zinc-600" />
            <path d="M80 70 l 15 15 l 30 -30" strokeWidth="4" className="text-green-500" />
          </g>
        </svg>
    ),
     'journal': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
             <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M60 30 H 140 V 130 H 60 Z" className="text-zinc-300 dark:text-zinc-600" />
                <line x1="60" y1="50" x2="140" y2="50" />
                <line x1="80" y1="30" x2="80" y2="130" />
                <path d="M90 70 L 130 70" />
                 <path d="M90 90 L 120 90" />
             </g>
        </svg>
    ),
     'calendar': (
         <svg viewBox="0 0 200 150" className="w-48 h-auto">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="50" y="40" width="100" height="80" rx="8" className="text-zinc-300 dark:text-zinc-600" />
            <line x1="50" y1="65" x2="150" y2="65" />
            <line x1="80" y1="40" x2="80" y2="65" />
            <line x1="120" y1="40" x2="120" y2="65" />
            <circle cx="125" cy="95" r="15" className="text-violet-400/50 fill-violet-400/20" />
            <path d="M122 92 l 3 3 l 5 -5" className="text-violet-500" strokeWidth="2.5" />
          </g>
        </svg>
    )
};

export const EmptyState: React.FC<EmptyStateProps> = ({ illustration, message }) => {
  return (
    <div className="text-center p-4 py-8 bg-zinc-100/50 dark:bg-zinc-800/20 rounded-xl flex flex-col items-center justify-center min-h-[150px]">
      <div className="mb-4">
        {illustrations[illustration]}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">{message}</p>
    </div>
  );
};
