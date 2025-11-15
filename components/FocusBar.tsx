
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface FocusBarProps {
  task: Task;
  onClose: () => void;
  onTaskComplete: (taskId: string) => void;
}

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

type SessionType = 'work' | 'short-break' | 'long-break';

export const FocusBar: React.FC<FocusBarProps> = ({ task, onClose, onTaskComplete }) => {
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined = undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      
      if (sessionType === 'work') {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        new Notification('Фокус-сессия завершена!', { body: `Отличная работа! Время для перерыва.` });
        if (newSessionCount % 4 === 0) {
          setSessionType('long-break');
          setTimeLeft(LONG_BREAK_DURATION);
        } else {
          setSessionType('short-break');
          setTimeLeft(SHORT_BREAK_DURATION);
        }
      } else { // break ended
        new Notification('Перерыв окончен!', { body: `Время вернуться к задаче: ${task.title}` });
        setSessionType('work');
        setTimeLeft(WORK_DURATION);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, task.title, sessionType, sessionCount]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const handleSkip = () => {
      setTimeLeft(0);
  }
  
  const handleCompleteTask = () => {
      onTaskComplete(task.id);
      onClose();
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getBarColor = () => {
      switch(sessionType) {
          case 'work': return 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
          case 'short-break': return 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800';
          case 'long-break': return 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800';
      }
  }
  
  const getSessionInfo = () => {
      switch(sessionType) {
          case 'work': return { icon: 'fa-solid fa-crosshairs', text: 'Фокус на задаче:', title: task.title };
          case 'short-break': return { icon: 'fa-solid fa-mug-hot', text: 'Короткий перерыв', title: '5 минут отдыха' };
          case 'long-break': return { icon: 'fa-solid fa-couch', text: 'Длинный перерыв', title: '15 минут отдыха' };
      }
  }
  
  const { icon, text, title } = getSessionInfo();

  return (
    <div className={`fixed bottom-0 left-0 right-0 shadow-2xl border-t p-4 flex flex-wrap items-center justify-between z-40 animate-fade-in-up transition-colors duration-300 ${getBarColor()} gap-4`}>
      {/* Left Part: Task Info */}
      <div className="flex items-center flex-grow min-w-[200px]">
        <i className={`fas ${icon} text-zinc-500 text-xl mr-4`}></i>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
          <p className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate max-w-[25vw] sm:max-w-xs">{title}</p>
        </div>
      </div>

      {/* Center Part: Timer and Controls */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 flex-shrink-0 mx-auto">
        <div className="text-sm text-zinc-500 dark:text-zinc-300 flex items-center gap-2" title="Завершенные фокус-сессии">
          <i className="fa-solid fa-brain"></i>
          <span className="font-semibold">{sessionCount}</span>
        </div>
        <div className="font-mono text-3xl font-bold text-zinc-800 dark:text-zinc-200 w-32 text-center">
          <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
        </div>
        <button onClick={toggleTimer} className="px-4 py-2 w-28 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-800 dark:hover:bg-zinc-200 font-semibold">
            <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isActive ? 'Пауза' : 'Старт'}
        </button>
        <button onClick={handleSkip} title={sessionType === 'work' ? "Завершить сессию" : "Пропустить перерыв"} className="px-4 py-2 text-zinc-600 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 rounded-lg transition-colors shadow-sm flex items-center justify-center hover:bg-zinc-300">
            <i className="fas fa-forward"></i>
        </button>
      </div>

      {/* Right Part: Actions */}
      <div className="flex items-center justify-end space-x-2 sm:space-x-6 flex-grow min-w-[200px]">
        <button onClick={handleCompleteTask} className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm flex items-center" title="Завершить задачу">
          <i className="fas fa-check-circle sm:mr-2"></i>
          <span className="hidden sm:inline">Завершить задачу</span>
        </button>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-xl" title="Закрыть панель фокуса">
          <i className="fas fa-times-circle"></i>
        </button>
      </div>
    </div>
  );
};
