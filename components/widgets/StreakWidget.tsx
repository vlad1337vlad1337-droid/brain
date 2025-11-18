import React from 'react';
import { StreakData } from '../../types';

interface StreakWidgetProps {
  streakData: StreakData;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({ streakData }) => {
  const { currentStreak, longestStreak } = streakData;

  const getFlameColor = () => {
    if (currentStreak === 0) return 'text-zinc-400 dark:text-zinc-600';
    if (currentStreak < 5) return 'text-orange-400';
    if (currentStreak < 15) return 'text-orange-500';
    return 'text-red-500';
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center relative" title={`Самый длинный стрик: ${longestStreak} дней`}>
      <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
         <i className={`fa-solid fa-fire-alt ${getFlameColor()} ${currentStreak > 15 ? 'animate-pulse' : ''}`}></i>
      </div>
      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-1">{currentStreak}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {currentStreak > 0 ? `дней подряд!` : 'Держите темп!'}
      </p>
      <p className="absolute bottom-2 text-xs text-zinc-400 dark:text-zinc-500">
        Рекорд: {longestStreak}
      </p>
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