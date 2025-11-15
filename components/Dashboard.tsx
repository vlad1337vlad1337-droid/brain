
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Project, TimeOfDay, Category, Holiday } from '../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { EndOfDayReview } from './EndOfDayReview';
import { getTasksForDate } from '../services/taskService';
import { getHoliday } from '../services/holidayService';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  onUpdateTask: (task: Task) => void;
  isBurntOutMode: boolean;
  onSetFocusTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onSaveReview: (summary: string) => void;
  onPostponeTask: (taskId: string) => void;
  onViewHoliday: (holiday: Holiday) => void;
}

interface TaskListProps {
    title: string;
    tasks: Task[];
    projects: Project[];
    categories: Category[];
    onUpdateTask: (task: Task) => void;
    onSetFocusTask: (task: Task) => void;
    onEdit: (task: Task) => void;
    onPostponeTask: (taskId: string) => void;
    illustration: 'overdue' | 'completed';
    emptyMessage: string;
}

const WelcomeCard: React.FC<{ overdueCount: number; dueTodayCount: number; completedTodayCount: number }> = ({ overdueCount, dueTodayCount, completedTodayCount }) => {
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden animate-fade-in-up">
            <div className="z-10">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Добро пожаловать!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Сегодня {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
                <div className="flex items-center gap-6 mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
                        <p>Просрочено</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{dueTodayCount}</p>
                        <p>На сегодня</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">{completedTodayCount}</p>
                        <p>Выполнено</p>
                    </div>
                </div>
            </div>
            <div className="absolute -right-10 -bottom-12 text-zinc-100 dark:text-zinc-700 opacity-80 z-0">
                <i className="fa-solid fa-brain text-[140px]"></i>
            </div>
        </div>
    );
};


const TaskList: React.FC<TaskListProps> = ({ title, tasks, projects, categories, onUpdateTask, onSetFocusTask, onEdit, onPostponeTask, illustration, emptyMessage }) => {
    if (tasks.length === 0) {
        return (
            <div>
                 <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 mb-4 px-1">{title}</h3>
                 <EmptyState illustration={illustration} message={emptyMessage} />
            </div>
        );
    }
    return (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms'}}>
            <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 mb-4 px-1">{title}</h3>
            <div className="space-y-2.5 flex-1">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        project={projects.find(p => p.id === task.projectId)}
                        category={categories.find(c => c.id === task.categoryId)}
                        onUpdate={onUpdateTask} 
                        onSetFocus={onSetFocusTask}
                        onEdit={onEdit}
                        onPostponeTask={onPostponeTask}
                    />
                ))}
            </div>
        </div>
    );
};

const TodayTasks: React.FC<Omit<TaskListProps, 'title' | 'illustration' | 'emptyMessage'>> = ({ tasks, ...rest }) => {
    const groupedTasks = useMemo(() => {
        const groups: Record<TimeOfDay | 'other', Task[]> = { morning: [], afternoon: [], evening: [], other: [] };
        tasks.forEach(task => {
            if (task.timeOfDay) groups[task.timeOfDay].push(task);
            else groups.other.push(task);
        });
        return groups;
    }, [tasks]);
    
    if (tasks.length === 0) {
         return <EmptyState illustration="all-done" message="Все задачи на сегодня выполнены. Отличная работа!" />
    }

    const TaskSubList: React.FC<{title: string; tasks: Task[]}> = ({ title, tasks }) => {
        if (tasks.length === 0) return null;
        return (
            <div>
                <h4 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-2 text-sm">{title}</h4>
                <div className="space-y-2.5">
                    {tasks.map(task => (
                         <TaskCard 
                            key={task.id} 
                            task={task} 
                            project={rest.projects.find(p => p.id === task.projectId)}
                            category={rest.categories.find(c => c.id === task.categoryId)}
                            onUpdate={rest.onUpdateTask} 
                            onSetFocus={rest.onSetFocusTask}
                            onEdit={rest.onEdit}
                            onPostponeTask={rest.onPostponeTask}
                        />
                    ))}
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
            <TaskSubList title="Утро ☀️" tasks={groupedTasks.morning} />
            <TaskSubList title="День 🌤️" tasks={groupedTasks.afternoon} />
            <TaskSubList title="Вечер 🌙" tasks={groupedTasks.evening} />
            <TaskSubList title="Без времени" tasks={groupedTasks.other} />
        </div>
    );
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, categories, onUpdateTask, isBurntOutMode, onSetFocusTask, onEditTask, onViewTask, onSaveReview, onPostponeTask, onViewHoliday }) => {
    const [showEndOfDay, setShowEndOfDay] = useState(false);

    const { overdue, dueToday, completedToday } = useMemo(() => getTasksForDate(tasks, new Date()), [tasks]);
    const todayHoliday = useMemo(() => getHoliday(new Date()), []);

    useEffect(() => {
        const checkTime = () => {
            const currentHour = new Date().getHours();
            if (currentHour >= 18) {
                setShowEndOfDay(true);
            }
        };
        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const handleTaskClick = (task: Task) => {
        if (task.isDone) {
            onViewTask(task);
        } else {
            onEditTask(task);
        }
    };

    const commonTaskListProps = { projects, categories, onUpdateTask, onSetFocusTask, onEdit: handleTaskClick, onPostponeTask };

    return (
        <div className="p-4 sm:p-6 space-y-8">
            <WelcomeCard 
                overdueCount={overdue.length} 
                dueTodayCount={dueToday.length} 
                completedTodayCount={completedToday.length} 
            />
            
            {todayHoliday && (
                <div 
                    onClick={() => onViewHoliday(todayHoliday)}
                    className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow animate-fade-in-up"
                >
                    <div className="flex items-center gap-4 z-10">
                        <i className={`fa-solid fa-gift text-3xl ${todayHoliday.country === 'RU' ? 'text-blue-500' : 'text-cyan-400'}`}></i>
                        <div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Сегодня праздник!</h3>
                            <p className="text-zinc-600 dark:text-zinc-300">{todayHoliday.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 z-10">
                        <span>Подробнее</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </div>
                    <div className={`absolute -right-4 -bottom-8 text-zinc-100 dark:text-zinc-700/50 opacity-80 z-0 ${todayHoliday.country === 'RU' ? 'text-blue-500' : 'text-cyan-400'}`}>
                         <i className="fa-solid fa-gift text-[100px]"></i>
                    </div>
                </div>
            )}

            {showEndOfDay && <EndOfDayReview tasks={tasks} onSaveReview={onSaveReview} />}

            {isBurntOutMode && (
                <div className="bg-violet-100 dark:bg-violet-900/50 border-l-4 border-violet-500 text-violet-800 dark:text-violet-200 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Активен режим выгорания</p>
                    <p>Показана только самая важная задача. Будьте добры к себе сегодня.</p>
                </div>
            )}
            
            <div className="space-y-8">
                {overdue.length > 0 && (
                    <TaskList 
                        title="Просрочено"
                        tasks={overdue}
                        {...commonTaskListProps}
                        illustration="overdue"
                        emptyMessage="У вас нет просроченных задач. Так держать!"
                    />
                )}
                
                <div>
                    <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 mb-4 px-1">План на сегодня</h3>
                    <TodayTasks
                        tasks={dueToday}
                        {...commonTaskListProps}
                    />
                </div>
                 
                 <TaskList 
                    title="Выполнено сегодня"
                    tasks={completedToday}
                    {...commonTaskListProps}
                    illustration="completed"
                    emptyMessage="Завершенные сегодня задачи появятся здесь."
                />
            </div>
        </div>
    );
};
