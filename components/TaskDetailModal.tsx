import React from 'react';
import { Task, Project, Category } from '../types';
import { TASK_PRIORITY_CONFIG } from '../constants';

interface TaskDetailModalProps {
  task: Task;
  projects: Project[];
  categories: Category[];
  onClose: () => void;
}

const DetailItem: React.FC<{ icon: string; label: string; value: React.ReactNode; color?: string }> = ({ icon, label, value, color }) => (
    <div className="flex items-start gap-3">
        <i className={`fa-solid ${icon} text-zinc-400 dark:text-zinc-500 text-lg w-6 text-center mt-1`} style={{ color }}></i>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">{value}</p>
        </div>
    </div>
);


export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, projects, categories, onClose }) => {
    const project = projects.find(p => p.id === task.projectId);
    const category = categories.find(c => c.id === task.categoryId);
    const priorityInfo = TASK_PRIORITY_CONFIG[task.priority];
    
    const recurrenceText: Record<string, string> = {
        daily: 'Ежедневно',
        weekly: 'Еженедельно',
        monthly: 'Ежемесячно',
        yearly: 'Ежегодно',
    };
    
    const timeOfDayText: Record<string, string> = {
        morning: 'Утро',
        afternoon: 'День',
        evening: 'Вечер',
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2">{task.title}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex-shrink-0 ml-4">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <DetailItem 
                            icon={task.isDone ? 'fa-check-circle' : 'fa-circle-notch'} 
                            label="Статус"
                            value={task.isDone ? 'Выполнено' : 'В работе'}
                            color={task.isDone ? '#22c55e' : '#f97316'}
                        />
                        {task.completedAt && (
                             <DetailItem 
                                icon="fa-calendar-check" 
                                label="Завершено"
                                value={new Date(task.completedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            />
                        )}
                        {task.deadline && (
                            <DetailItem 
                                icon="fa-calendar-day" 
                                label="Крайний срок"
                                value={new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            />
                        )}
                         <DetailItem 
                            icon={priorityInfo.icon} 
                            label="Приоритет"
                            value={priorityInfo.text}
                        />
                         {project && (
                             <DetailItem 
                                icon={project.icon || 'fa-folder'} 
                                label="Проект"
                                value={project.name}
                                color={project.color}
                            />
                        )}
                         {category && (
                             <DetailItem 
                                icon={category.icon} 
                                label="Категория"
                                value={category.name}
                                color={category.color}
                            />
                        )}
                        {task.recurrence && (
                            <DetailItem 
                                icon="fa-repeat" 
                                label="Повторение"
                                value={recurrenceText[task.recurrence]}
                            />
                        )}
                        {task.timeOfDay && (
                            <DetailItem 
                                icon="fa-clock" 
                                label="Время дня"
                                value={timeOfDayText[task.timeOfDay]}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-8 text-right">
                    <button onClick={onClose} className="px-5 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm hover:shadow-md">Закрыть</button>
                </div>
            </div>
        </div>
    );
};
