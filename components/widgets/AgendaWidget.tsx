import React from 'react';
import { Task } from '../../types';
import { isSameDay } from '../../utils/dateUtils';

interface AgendaWidgetProps {
    tasks: Task[];
    onUpdateTask: (task: Task) => void;
    onOpenNewTask: () => void;
}

export const AgendaWidget: React.FC<AgendaWidgetProps> = ({ tasks, onUpdateTask, onOpenNewTask }) => {
    const today = new Date();
    const todaysTasks = tasks.filter(task => task.deadline && isSameDay(new Date(task.deadline), today));
    const activeTasks = todaysTasks.filter(task => !task.isDone);
    const completedCount = todaysTasks.length - activeTasks.length;
    const progress = todaysTasks.length > 0 ? (completedCount / todaysTasks.length) * 100 : 0;

    const handleToggle = (task: Task) => {
        onUpdateTask({ ...task, isDone: !task.isDone, completedAt: !task.isDone ? new Date() : undefined });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-violet-500"></i>
                    План на сегодня
                </h3>
                <button
                    onClick={onOpenNewTask}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20"
                    title="Добавить задачу на сегодня"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                </button>
            </div>

            {todaysTasks.length > 0 && (
                 <div className="mb-2">
                    <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>Прогресс</span>
                        <span>{completedCount}/{todaysTasks.length}</span>
                    </div>
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1">
                        <div className="bg-violet-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
            
            {activeTasks.length > 0 ? (
                <ul className="space-y-1.5 overflow-y-auto flex-1 -mr-2 pr-2">
                    {activeTasks.map(task => (
                        <li key={task.id} className="text-xs flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 group">
                             <button
                                onClick={() => handleToggle(task)}
                                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-zinc-300 dark:border-zinc-500 group-hover:border-violet-400 flex items-center justify-center"
                            ></button>
                            <span className="flex-1">{task.title}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <i className="fa-solid fa-check-circle text-3xl text-green-500 mb-2"></i>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Все задачи на сегодня выполнены!</p>
                </div>
            )}
        </div>
    );
};