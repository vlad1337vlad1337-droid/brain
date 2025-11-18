import React, { useState } from 'react';
import { Task, Project, Category } from '../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { isSameDay } from '../utils/dateUtils';

interface CalendarSidebarProps {
  selectedDate: Date | null;
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  onEditTask: (task: Task) => void;
  onAddTask: (date: Date) => void;
  onUpdateTask: (task: Task) => void;
  onSetFocusTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onClose: () => void;
  onPostponeTask: (taskId: string) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = (props) => {
    const { selectedDate, tasks, projects, categories, onEditTask, onAddTask, onUpdateTask, onSetFocusTask, onDragStart, onClose, onPostponeTask } = props;
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            onUpdateTask({ ...task, deadline: undefined, timeOfDay: undefined });
        }
    };

    if (selectedDate) {
        const tasksForDay = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), selectedDate));
        return (
            <div className="w-96 flex-shrink-0 bg-white dark:bg-zinc-900 p-4 flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-fade-in h-full">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" title="Закрыть">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2 hide-scrollbar min-h-0 flex flex-col">
                    {tasksForDay.length > 0 ? (
                        tasksForDay.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                project={projects.find(p => p.id === task.projectId)}
                                category={categories.find(c => c.id === task.categoryId)}
                                onUpdate={onUpdateTask}
                                onSetFocus={onSetFocusTask}
                                onEdit={onEditTask}
                                onPostponeTask={onPostponeTask}
                            />
                        ))
                    ) : (
                        <div className="flex-grow flex items-center justify-center">
                            <EmptyState
                                illustration="calendar"
                                message="На этот день нет запланированных задач."
                            />
                        </div>
                    )}
                </div>
                <button onClick={() => onAddTask(selectedDate)} className="mt-4 w-full py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors shadow-sm flex items-center justify-center font-semibold flex-shrink-0">
                    <i className="fas fa-plus mr-2"></i>
                    Новая задача
                </button>
            </div>
        )
    }

    const unscheduledTasks = tasks.filter(task => !task.deadline && !task.isDone);
    return (
        <div 
            className={`w-96 flex-shrink-0 bg-white dark:bg-zinc-900 p-4 flex flex-col border-l border-zinc-200 dark:border-zinc-800 transition-colors animate-fade-in h-full ${isDragOver ? 'bg-violet-50 dark:bg-violet-900/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <div className="flex justify-between items-center mb-2 flex-shrink-0">
                 <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center">
                    <i className="fa-solid fa-inbox mr-2"></i>Нераспределенные
                </h3>
                <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" title="Закрыть">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-shrink-0">Перетащите задачу на календарь, чтобы запланировать, или сюда, чтобы убрать дедлайн.</p>
            <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2 hide-scrollbar min-h-0 flex flex-col">
                {unscheduledTasks.length > 0 ? unscheduledTasks.map(task => (
                    <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task)}
                        className="p-3 rounded-lg cursor-grab bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:cursor-grabbing transition-colors"
                    >
                        <p className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{task.title}</p>
                    </div>
                )) : (
                     <div className="flex-grow flex items-center justify-center">
                        <EmptyState
                            illustration="all-done"
                            message="Нет задач без крайнего срока. Все спланировано!"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};