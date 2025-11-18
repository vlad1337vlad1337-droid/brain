import React, { useState, useEffect, useMemo } from 'react';
import { Task, Project, TimeOfDay, Category, Holiday, Employee, TaskPriority } from '../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { EndOfDayReview } from './EndOfDayReview';
import { getTasksForDate } from '../services/taskService';
import { getHoliday } from '../services/holidayService';
import { parseTaskFromText } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  employees: Employee[];
  onUpdateTask: (task: Task) => void;
  isBurntOutMode: boolean;
  onSetFocusTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onSaveReview: (summary: string) => void;
  onPostponeTask: (taskId: string) => void;
  onViewHoliday: (holiday: Holiday) => void;
  onAddTask: (task: Task) => Promise<void>;
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

const MagicInput: React.FC<{
  projects: Project[];
  categories: Category[];
  employees: Employee[];
  onTaskCreate: (task: Task) => Promise<void>;
}> = ({ projects, categories, employees, onTaskCreate }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedTask, setLastCreatedTask] = useState<Task | null>(null);

  const handleCreate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setLastCreatedTask(null);
    try {
      const parsedTask = await parseTaskFromText(text, projects, categories, employees);
      const newTask: Task = {
        id: `t${Date.now()}`,
        isDone: false,
        priority: TaskPriority.MEDIUM,
        ...parsedTask,
        title: parsedTask.title!, // title is required by schema
      };
      await onTaskCreate(newTask);
      setText('');
      setLastCreatedTask(newTask);
    } catch (e: any) {
      setError(e.message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm animate-fade-in-up relative">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-wand-magic-sparkles text-2xl text-violet-500"></i>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') handleCreate() }}
          placeholder="Новая задача... (ИИ распознает детали)"
          className="flex-grow p-2 border-0 bg-transparent focus:ring-0 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          disabled={isLoading}
        />
        <button
          onClick={handleCreate}
          disabled={isLoading || !text.trim()}
          className="px-5 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-all shadow-sm disabled:bg-violet-400/80 disabled:cursor-not-allowed flex items-center justify-center w-32"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Создать'
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2 pl-10">{error}</p>}
      {lastCreatedTask && !error && (
        <div className="text-xs text-green-600 mt-2 pl-10 animate-fade-in">
          ✓ Задача "{lastCreatedTask.title}" успешно создана!
        </div>
      )}
    </div>
  );
};


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

export const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, categories, employees, onUpdateTask, isBurntOutMode, onSetFocusTask, onEditTask, onViewTask, onSaveReview, onPostponeTask, onViewHoliday, onAddTask }) => {
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
            
             <MagicInput 
                projects={projects} 
                categories={categories} 
                employees={employees}
                onTaskCreate={onAddTask}
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