
import React from 'react';
import { StreakData } from '../types';

interface StreakCounterProps {
  streakData: StreakData;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streakData }) => {
  const { currentStreak, longestStreak } = streakData;

  const getFlameColor = () => {
    if (currentStreak === 0) return 'text-zinc-400 dark:text-zinc-600';
    if (currentStreak < 5) return 'text-orange-400';
    if (currentStreak < 15) return 'text-orange-500';
    return 'text-red-500';
  }

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl group relative" title={`Самый длинный стрик: ${longestStreak} дней`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Огонь продуктивности</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {currentStreak > 0 ? `${currentStreak} дней подряд!` : 'Держите темп!'}
          </p>
        </div>
        <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
           <i className={`fa-solid fa-fire-alt ${getFlameColor()} ${currentStreak > 15 ? 'animate-pulse' : ''}`}></i>
        </div>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-3">
        <div 
          className="bg-orange-400 h-1.5 rounded-full transition-all duration-500" 
          style={{width: `${Math.min((currentStreak / 30) * 100, 100)}%`}}>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          50% { opacity: .7; }
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};