
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TimeOfDay, Project, Category, Holiday } from '../types';
import { CalendarSidebar } from './CalendarSidebar';
import { TASK_PRIORITY_CONFIG } from '../constants';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { getHoliday } from '../services/holidayService';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onAddTask: (date: Date, timeOfDay?: TimeOfDay) => void;
  onUpdateTask: (task: Task) => void;
  onSetFocusTask: (task: Task) => void;
  onPostponeTask: (taskId: string) => void;
  weekendDays: number[];
  onViewHoliday: (holiday: Holiday) => void;
}

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);
    return matches;
};


const UnscheduledTasksModal: React.FC<Omit<CalendarViewProps, 'weekendDays' | 'onViewTask' | 'onViewHoliday'> & { onClose: () => void }> = ({ tasks, projects, categories, onUpdateTask, onClose }) => {
    const unscheduled = tasks.filter(t => !t.deadline && !t.isDone);
    
    const getAssociatedItem = (task: Task) => {
        const project = projects.find(p => p.id === task.projectId);
        if (project) return { name: project.name, icon: project.icon, color: project.color };
        const category = categories.find(c => c.id === task.categoryId);
        if (category) return { name: category.name, icon: category.icon, color: category.color };
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-zinc-100 dark:bg-zinc-800 w-full max-w-2xl max-h-[70vh] rounded-t-2xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="text-center pb-2">
                    <div className="inline-block w-10 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
                </div>
                <h2 className="text-xl font-bold text-center text-zinc-800 dark:text-zinc-100 mb-4">Нераспределенные задачи</h2>
                <div className="overflow-y-auto space-y-2 pr-2">
                    {unscheduled.length > 0 ? (
                        unscheduled.map(task => {
                            const item = getAssociatedItem(task);
                            return (
                                <div key={task.id} className="bg-white dark:bg-zinc-900/50 p-3 rounded-lg flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{task.title}</p>
                                        {item && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                <i className={`fa-solid ${item.icon}`} style={{color: item.color}}></i>
                                                <span>{item.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                      onClick={() => onUpdateTask({ ...task, deadline: new Date() })}
                                      className="px-3 py-1.5 bg-violet-500 text-white text-xs rounded-lg hover:bg-violet-600 font-semibold transition-colors flex-shrink-0"
                                      title="Запланировать на сегодня"
                                    >
                                      На сегодня
                                    </button>
                                </div>
                            )
                        })
                    ) : <EmptyState illustration="all-done" message="Все задачи запланированы!" />}
                </div>
            </div>
        </div>
    );
};

export const CalendarView: React.FC<CalendarViewProps> = (props) => {
    const { tasks, onUpdateTask, onAddTask, weekendDays, onViewHoliday } = props;
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showUnscheduled, setShowUnscheduled] = useState(false);
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
    const isMobile = useMediaQuery('(max-width: 1024px)'); // Breakpoint for sidebar
    const [viewMode, setViewMode] = useState<'month' | 'agenda'>(isMobile ? 'agenda' : 'month');
    const [showUnscheduledModal, setShowUnscheduledModal] = useState(false);

    useEffect(() => {
        setViewMode(isMobile ? 'agenda' : 'month');
    }, [isMobile]);

    const unscheduledTasksCount = useMemo(() => tasks.filter(t => !t.deadline && !t.isDone).length, [tasks]);
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const handleDragStart = (e: React.DragEvent, task: Task) => e.dataTransfer.setData('taskId', task.id);
    const handleDragOver = (e: React.DragEvent, date: Date) => { e.preventDefault(); if (!dragOverDate || !isSameDay(dragOverDate, date)) setDragOverDate(date); };
    const handleDragLeave = () => setDragOverDate(null);
    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        setDragOverDate(null);
        const taskId = e.dataTransfer.getData('taskId');
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate) {
            const newDeadline = new Date(date);
            if (taskToUpdate.deadline) newDeadline.setHours(new Date(taskToUpdate.deadline).getHours(), new Date(taskToUpdate.deadline).getMinutes());
            onUpdateTask({ ...taskToUpdate, deadline: newDeadline });
        }
    };
    
    const navigateDate = (offset: number) => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + offset); return d; });
    const handleShowUnscheduled = () => { if (isMobile) { setShowUnscheduledModal(true); } else { setSelectedDate(null); setShowUnscheduled(p => !p); } };
    const handleCloseSidebar = () => { setSelectedDate(null); setShowUnscheduled(false); };
    const handleTaskClick = (task: Task) => task.isDone ? props.onViewTask(task) : props.onEditTask(task);

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4 px-2 flex-wrap gap-2">
            <h2 className="text-2xl font-bold capitalize text-zinc-800 dark:text-zinc-100">{new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(currentDate)}</h2>
            <div className="flex items-center gap-2 flex-wrap">
                {!isMobile && (
                     <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700 p-1 rounded-lg">
                        <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'month' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}>Месяц</button>
                        <button onClick={() => setViewMode('agenda')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'agenda' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}>Повестка</button>
                    </div>
                )}
                <button onClick={handleShowUnscheduled} className={`px-3 py-1.5 text-sm font-semibold rounded-lg relative transition-colors ${showUnscheduled ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400' : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'}`}>
                    Нераспределенные
                    {unscheduledTasksCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full">{unscheduledTasksCount}</span>}
                </button>
                <button onClick={() => navigateDate(-1)} className="p-2 w-9 h-9 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><i className="fas fa-chevron-left"></i></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600">Сегодня</button>
                <button onClick={() => navigateDate(1)} className="p-2 w-9 h-9 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"><i className="fas fa-chevron-right"></i></button>
            </div>
        </div>
    );

    const renderMonthView = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const dayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - dayOfWeek);
        const days = Array.from({ length: 42 }, (_, i) => {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            return day;
        });

        return (
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => <div key={day} className="text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400 py-2">{day}</div>)}
                {days.map(day => {
                    const tasksForDay = tasks.filter(task => task.deadline && isSameDay(new Date(task.deadline), day));
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isDragOver = dragOverDate && isSameDay(day, dragOverDate);
                    const holiday = getHoliday(day);
                    
                    return (
                        <div 
                            key={day.toISOString()}
                            className={`rounded-lg p-2 flex flex-col overflow-hidden transition-all duration-200 relative group border-2 ${isDragOver ? 'border-violet-500' : isSelected ? 'border-violet-500' : 'border-transparent'} ${isSelected ? 'bg-violet-100 dark:bg-violet-900/50' : isCurrentMonth ? 'bg-white/50 dark:bg-zinc-800/50' : 'bg-zinc-100/30 dark:bg-zinc-800/10'}`}
                            onClick={() => { setSelectedDate(day); setShowUnscheduled(false); }}
                            onDragOver={(e) => handleDragOver(e, day)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day)}
                        >
                            <div className="flex justify-between items-center mb-1 h-7">
                                <span className={`h-7 w-7 flex items-center justify-center text-sm font-semibold rounded-full ${isToday ? 'bg-violet-500 text-white' : isCurrentMonth ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>{day.getDate()}</span>
                                {holiday && (<button onClick={(e) => { e.stopPropagation(); onViewHoliday(holiday); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" title={holiday.name}><i className={`fa-solid fa-gift text-base ${holiday.country === 'RU' ? 'text-blue-500' : 'text-cyan-400'}`}></i></button>)}
                            </div>
                            <div className="flex-1 space-y-1 overflow-y-auto text-sm hide-scrollbar pr-1">
                                {tasksForDay.slice(0, 3).map(task => (
                                    <div key={task.id} draggable={!task.isDone} onDragStart={(e) => !task.isDone && handleDragStart(e, task)} className={`px-2 py-0.5 rounded text-left w-full ${!task.isDone ? 'cursor-grab' : ''} ${TASK_PRIORITY_CONFIG[task.priority].color} bg-opacity-20`} title={task.title}>
                                        <span className={`truncate text-xs font-medium ${task.isDone ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}`}>{task.title}</span>
                                    </div>
                                ))}
                                {tasksForDay.length > 3 && <div className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">+ {tasksForDay.length - 3} еще</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    }

    const renderAgendaView = () => {
        const scheduledTasks = tasks.filter(t => t.deadline && !t.isDone).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
        if (scheduledTasks.length === 0) return <div className="p-4"><EmptyState illustration="calendar" message="Нет запланированных задач."/></div>;
        const groupedByDay = scheduledTasks.reduce((acc, task) => { const dateStr = new Date(task.deadline!).toDateString(); (acc[dateStr] = acc[dateStr] || []).push(task); return acc; }, {} as Record<string, Task[]>);
    
        return (
            <div className="space-y-6 p-4">
                {Object.entries(groupedByDay).map(([dateStr, dayTasks]) => (
                    <div key={dateStr} className="animate-fade-in-up">
                        <h3 className={`font-bold text-lg capitalize sticky top-0 bg-zinc-50/80 dark:bg-zinc-800/80 backdrop-blur-sm py-2 z-10 ${isSameDay(new Date(dateStr), new Date()) ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                            {new Date(dateStr).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </h3>
                        <div className="mt-2 space-y-2.5">{dayTasks.map(task => <TaskCard key={task.id} {...props} task={task} project={props.projects.find(p => p.id === task.projectId)} category={props.categories.find(c => c.id === task.categoryId)} onUpdate={props.onUpdateTask} onSetFocus={props.onSetFocusTask} onEdit={handleTaskClick} onPostponeTask={props.onPostponeTask}/>)}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex h-full bg-transparent">
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {renderHeader()}
                {(viewMode === 'month' && !isMobile) ? renderMonthView() : <div className="overflow-y-auto flex-1 pr-2">{renderAgendaView()}</div>}
            </div>
            {!isMobile && (selectedDate || showUnscheduled) && <CalendarSidebar {...props} onEditTask={handleTaskClick} selectedDate={selectedDate} onClose={handleCloseSidebar} onDragStart={handleDragStart}/>}
            {showUnscheduledModal && <UnscheduledTasksModal {...props} onClose={() => setShowUnscheduledModal(false)} />}
        </div>
    );
};
