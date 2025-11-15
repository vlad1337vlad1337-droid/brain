


import React from 'react';
import { Task, Project, Category } from '../types';
import { TASK_PRIORITY_CONFIG } from '../constants';

interface TaskCardProps {
  task: Task;
  project?: Project;
  category?: Category;
  onUpdate: (task: Task) => void;
  onSetFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onPostponeTask: (taskId: string) => void;
}

const CustomCheckbox: React.FC<{ isDone: boolean; onClick: (e: React.MouseEvent) => void; }> = ({ isDone, onClick }) => (
    <div 
        onClick={onClick}
        className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 border-2 ${
            isDone 
            ? 'bg-violet-500 border-violet-500' 
            : 'bg-transparent border-zinc-300 dark:border-zinc-600 group-hover:border-violet-400'
        }`}
        title={isDone ? "Вернуть в работу" : "Отметить выполненной"}
    >
        {isDone && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        )}
    </div>
);


export const TaskCard: React.FC<TaskCardProps> = ({ task, project, category, onUpdate, onSetFocus, onEdit, onPostponeTask }) => {
  const { id, title, isDone, priority, recurrence } = task;

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...task, isDone: !isDone });
  };
  
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }

  const item = project || category;
  const itemType = project ? 'Проект' : 'Категория';

  return (
    <div 
      onClick={() => onEdit(task)}
      className={`p-4 rounded-xl transition-all duration-200 flex items-start space-x-4 group animate-fade-in-up relative cursor-pointer ${
        isDone 
        ? 'bg-zinc-100 dark:bg-zinc-800/50 opacity-60' 
        : 'bg-white dark:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <CustomCheckbox isDone={isDone} onClick={handleStatusChange} />
      
      <div className="flex-1">
        <p className={`font-medium ${isDone ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
          {title}
        </p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          <div className="flex items-center space-x-1.5" title={`Приоритет: ${TASK_PRIORITY_CONFIG[priority].text}`}>
            <div className={`w-2 h-2 rounded-full ${TASK_PRIORITY_CONFIG[priority].color}`}></div>
            <span>{TASK_PRIORITY_CONFIG[priority].text}</span>
          </div>
          {recurrence && (
             <div className="flex items-center space-x-1.5" title="Повторяющаяся задача">
                <i className="fa-solid fa-repeat"></i>
                <span>Повтор</span>
            </div>
          )}
          {item && (
             <div className="flex items-center space-x-1.5" title={`${itemType}: ${item.name}`}>
                <i className={`fa-solid ${item.icon || 'fa-folder'} w-4 text-center`} style={{color: item.color}}></i>
                <span>{item.name}</span>
            </div>
          )}
        </div>
      </div>
      {!isDone && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1">
            <button 
                onClick={(e) => handleActionClick(e, () => onPostponeTask(id))}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:text-white hover:bg-violet-500 dark:hover:text-white"
                title="Отложить на завтра"
                >
                <i className="fa-solid fa-calendar-day"></i>
            </button>
            <button 
              onClick={(e) => handleActionClick(e, () => onSetFocus(task))}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:text-white hover:bg-violet-500 dark:hover:text-white"
              title="Сфокусироваться"
            >
              <i className="fa-solid fa-crosshairs"></i>
            </button>
        </div>
      )}
    </div>
  );
};