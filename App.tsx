
import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { OsDesktop } from './components/OsDesktop';
import { OsTaskbar } from './components/OsTaskbar';
import { Dashboard } from './components/Dashboard';
import { IdeasView } from './components/IdeasView';
import { ProjectsView } from './components/ProjectsView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { JournalView } from './components/JournalView';
import { EmployeeView } from './components/EmployeeView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { FocusBar } from './components/FocusBar';
import { Confetti } from './components/Confetti';
import { Task, Project, Idea, Review, Category, TaskPriority, StreakData, TimeOfDay, Holiday, Employee, View, WindowInstance, AppDefinition } from './types';
import { APPLICATIONS } from './constants';
import * as dbService from './services/dbService';
import { getNextDueDate, getTasksForDate } from './services/taskService';
import { getHolidayDescription } from './services/geminiService';

type ModalState = {
  mode: 'new' | 'edit';
  data?: Task;
  prefill?: Partial<Task>;
};

const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastCompletedDate: '' });
  const [weekendDays, setWeekendDays] = useState<number[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const [isBurntOutMode, setIsBurntOutMode] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [holidayToView, setHolidayToView] = useState<Holiday | null>(null);
  const [holidayDescription, setHolidayDescription] = useState<string>('');
  const [isHolidayLoading, setIsHolidayLoading] = useState<boolean>(false);

  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const zIndexCounter = useRef(10);
  const lastPosition = useRef({ x: 50, y: 50 });


  useEffect(() => {
    const loadData = async () => {
        await dbService.initDB();
        setTasks(await dbService.getTasks());
        setProjects(await dbService.getProjects());
        setIdeas(await dbService.getIdeas());
        setReviews(await dbService.getReviews());
        setCategories(await dbService.getCategories());
        setEmployees(await dbService.getEmployees());
        setTheme(await dbService.getSetting('theme', 'system'));
        setStreakData(await dbService.getSetting('streak', { currentStreak: 0, longestStreak: 0, lastCompletedDate: '' }));
        setWeekendDays(await dbService.getSetting('weekendDays', [0, 6]));
        setIsLoading(false);
        openApp('today');
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (holidayToView) {
        const fetchDescription = async () => {
            setIsHolidayLoading(true);
            const result = await getHolidayDescription(holidayToView.name, holidayToView.country);
            setHolidayDescription(result.description);
            setIsHolidayLoading(false);
        };
        fetchDescription();
    }
  }, [holidayToView]);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') root.classList.toggle('dark', e.matches);
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    if (theme === 'light') root.classList.remove('dark');
    else if (theme === 'dark') root.classList.add('dark');
    else root.classList.toggle('dark', mediaQuery.matches);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);
  
   useEffect(() => {
    const { dueToday, completedToday } = getTasksForDate(tasks, new Date());
    if (dueToday.length === 0 && completedToday.length > 0 && !showConfetti) {
        const justCompleted = completedToday.some(t => (new Date().getTime() - (t.completedAt ? new Date(t.completedAt).getTime() : 0)) < 2000);
        if (justCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }
  }, [tasks, showConfetti]);
  
  const handleSetTheme = async (newTheme: 'light' | 'dark' | 'system') => {
      setTheme(newTheme);
      await dbService.saveSetting('theme', newTheme);
  };

  const handleSaveTask = async (task: Task) => {
    await dbService.saveTask(task);
    setTasks(await dbService.getTasks());
    setModalState(null);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await dbService.deleteTask(taskId);
    setTasks(await dbService.getTasks());
    setModalState(null);
    setTaskToView(null);
  };
    
  const isWeekend = (date: Date, weekends: number[]) => weekends.includes(date.getDay());

  const updateStreak = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toDateString();
      let newStreakData = { ...streakData };

      if (newStreakData.lastCompletedDate === todayStr) return;

      if (!newStreakData.lastCompletedDate) {
          newStreakData = { currentStreak: 1, longestStreak: Math.max(newStreakData.longestStreak, 1), lastCompletedDate: todayStr };
      } else {
        const lastCompleted = new Date(newStreakData.lastCompletedDate);
        const diffDays = Math.round((today.getTime() - lastCompleted.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 0) return;

        let isContinuous = true;
        if (diffDays > 1) {
            for (let i = 1; i < diffDays; i++) {
                const checkDate = new Date(lastCompleted);
                checkDate.setDate(lastCompleted.getDate() + i);
                if (!isWeekend(checkDate, weekendDays)) {
                    isContinuous = false;
                    break;
                }
            }
        }
        
        if (isContinuous) {
            const newStreak = newStreakData.currentStreak + 1;
            newStreakData = { currentStreak: newStreak, longestStreak: Math.max(newStreakData.longestStreak, newStreak), lastCompletedDate: todayStr };
        } else {
            newStreakData = { currentStreak: 1, longestStreak: Math.max(newStreakData.longestStreak, 1), lastCompletedDate: todayStr };
        }
      }
      setStreakData(newStreakData);
      await dbService.saveSetting('streak', newStreakData);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const taskToUpdate = tasks.find(t => t.id === updatedTask.id);
    if (!taskToUpdate) return;
    
    if (updatedTask.isDone && !taskToUpdate.isDone) {
        await updateStreak();
        if (updatedTask.recurrence && updatedTask.deadline) {
            const nextDueDate = getNextDueDate(new Date(updatedTask.deadline), updatedTask.recurrence);
            await dbService.saveTask({ ...updatedTask, isDone: false, deadline: nextDueDate, completedAt: undefined });
        }
    }
    await dbService.saveTask(updatedTask);
    setTasks(await dbService.getTasks());
  };
    
  const handlePostponeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (task.deadline) {
          tomorrow.setHours(new Date(task.deadline).getHours(), new Date(task.deadline).getMinutes());
      }
      handleUpdateTask({ ...task, deadline: tomorrow });
    }
  };
  
  const handleSaveReview = async (aiSummary: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingReview = reviews.find(r => isSameDay(r.date, today));
    const reviewData = existingReview ? { ...existingReview, aiSummary } : { id: `r${Date.now()}`, date: today, aiSummary, userNotes: '' };
    await dbService.saveReview(reviewData);
    setReviews(await dbService.getReviews());
  };
  
  const handleUpdateReviewNotes = async (reviewId: string, notes: string) => {
      const review = reviews.find(r => r.id === reviewId);
      if(review) {
          await dbService.saveReview({...review, userNotes: notes});
          setReviews(await dbService.getReviews());
      }
  }

  const handleAddReview = async (notes: string, mood: Review['mood']) => {
    const newReview: Review = { id: `r${Date.now()}`, date: new Date(), aiSummary: '', userNotes: notes, mood };
    await dbService.saveReview(newReview);
    setReviews(await dbService.getReviews());
  };

  const handleUpdateReviewMood = async (reviewId: string, mood: Review['mood']) => {
      const review = reviews.find(r => r.id === reviewId);
      if(review) {
          await dbService.saveReview({...review, mood });
          setReviews(await dbService.getReviews());
      }
  };
  
  const handleAddIdea = async (text: string) => {
      const newIdea: Idea = { id: `i${Date.now()}`, text, createdAt: new Date() };
      await dbService.saveIdea(newIdea);
      setIdeas(await dbService.getIdeas());
  }
  
  const handleConvertToTask = async (idea: Idea) => {
      handleOpenModal('new', undefined, { title: idea.text });
      await dbService.deleteIdea(idea.id);
      setIdeas(ideas.filter(i => i.id !== idea.id));
  }
  
  const handleSetFocusTask = (task: Task) => {
      if (Notification.permission !== "granted") Notification.requestPermission();
      setFocusTask(task);
  }

  const handleOpenModal = (mode: 'new' | 'edit', data?: Task, prefill?: Partial<Task>) => setModalState({ mode, data, prefill });
  const handleViewTask = (task: Task) => setTaskToView(task);
  const handleSaveProject = async (project: Project) => { await dbService.saveProject(project); setProjects(await dbService.getProjects()); };
  const handleDeleteProject = async (projectId: string) => { await dbService.deleteProject(projectId); setProjects(await dbService.getProjects()); setTasks(await dbService.getTasks()); };
  const handleSaveCategory = async (category: Category) => { await dbService.saveCategory(category); setCategories(await dbService.getCategories()); };
  const handleDeleteCategory = async (categoryId: string) => { await dbService.deleteCategory(categoryId); setCategories(await dbService.getCategories()); setTasks(await dbService.getTasks()); };
  const handleUpdateWeekendDays = async (days: number[]) => { setWeekendDays(days); await dbService.saveSetting('weekendDays', days); };
  const handleResetData = async () => { await dbService.resetAllData(); window.location.reload(); };

  // --- Window Management ---
  const openApp = (appId: View) => {
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }
    const appDef = APPLICATIONS.find(app => app.id === appId);
    if (!appDef) return;

    zIndexCounter.current += 1;
    lastPosition.current = { x: lastPosition.current.x + 30, y: lastPosition.current.y + 30 };
    if(lastPosition.current.x > 300) lastPosition.current = { x: 50, y: 50 };

    const newWindow: WindowInstance = {
      id: `win-${Date.now()}`,
      appId,
      zIndex: zIndexCounter.current,
      isMinimized: false,
      isMaximized: false,
      position: { x: lastPosition.current.x, y: lastPosition.current.y },
      size: appDef.defaultSize,
    };
    setWindows(prev => [...prev, newWindow]);
  };

  const closeApp = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));
  
  const focusWindow = (id: string) => {
    zIndexCounter.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter.current, isMinimized: false } : w));
  };

  const minimizeWindow = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  }

  const handleDragStop = (id: string, pos: { x: number, y: number }) => setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  const handleResizeStop = (id: string, size: { width: number | string, height: number | string }, pos: { x: number, y: number }) => setWindows(prev => prev.map(w => w.id === id ? { ...w, size, position: pos } : w));

  const getFilteredTasks = () => {
    if (!isBurntOutMode) return tasks;
    const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH && !t.isDone);
    if (highPriority.length > 0) return highPriority.slice(0, 1);
    const nonDone = tasks.filter(t => !t.isDone);
    return nonDone.length > 0 ? nonDone.slice(0, 1) : [];
  };

  const renderApp = (appId: View) => {
    const commonProps = {
      tasks: getFilteredTasks(),
      projects,
      categories,
      onUpdateTask: handleUpdateTask,
      onSetFocusTask: handleSetFocusTask,
      onEditTask: (task: Task) => handleOpenModal('edit', task),
      onViewTask: handleViewTask,
      onPostponeTask: handlePostponeTask,
    };
    switch (appId) {
      case 'today': return <Dashboard {...commonProps} isBurntOutMode={false} onSaveReview={handleSaveReview} onViewHoliday={setHolidayToView} />;
      case 'projects': return <ProjectsView {...commonProps} />;
      case 'employees': return <EmployeeView {...commonProps} employees={employees} />;
      case 'ideas': return <IdeasView ideas={ideas} onAddIdea={handleAddIdea} onConvertToTask={handleConvertToTask} />;
      case 'calendar': return <CalendarView {...commonProps} weekendDays={weekendDays} onAddTask={(date, timeOfDay) => handleOpenModal('new', undefined, { deadline: date, timeOfDay })} onViewHoliday={setHolidayToView} />;
      case 'analytics': return <AnalyticsView tasks={tasks} projects={projects} categories={categories} />;
      case 'journal': return <JournalView reviews={reviews} onUpdateNotes={handleUpdateReviewNotes} onAddReview={handleAddReview} onUpdateMood={handleUpdateReviewMood} />;
      case 'settings': return <SettingsView projects={projects} categories={categories} onSaveProject={handleSaveProject} onDeleteProject={handleDeleteProject} onSaveCategory={handleSaveCategory} onDeleteCategory={handleDeleteCategory} weekendDays={weekendDays} onUpdateWeekendDays={handleUpdateWeekendDays} onResetData={handleResetData} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <i className="fa-solid fa-brain text-4xl text-violet-500 animate-pulse"></i>
          <h1 className="text-xl font-bold mt-4 text-zinc-800 dark:text-zinc-100">Загрузка WASEWORM OC...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen desktop-bg transition-all duration-500 overflow-hidden">
      <OsDesktop
        windows={windows}
        renderApp={renderApp}
        openApp={openApp}
        onClose={closeApp}
        onFocus={focusWindow}
        onMinimize={minimizeWindow}
        onMaximize={maximizeWindow}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
      />
      <OsTaskbar
        windows={windows}
        openApp={openApp}
        focusWindow={focusWindow}
        streakData={streakData}
        theme={theme}
        onSetTheme={handleSetTheme}
        onOpenNewTask={() => handleOpenModal('new')}
        isBurntOutMode={isBurntOutMode}
        onSetBurntOutMode={setIsBurntOutMode}
      />
      
      {focusTask && <FocusBar task={focusTask} onClose={() => setFocusTask(null)} onTaskComplete={(taskId) => { const t = tasks.find(t => t.id === taskId); if(t) handleUpdateTask({ ...t, isDone: true }); }} />}
      {modalState && <TaskModal initialState={modalState} onClose={() => setModalState(null)} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} projects={projects} categories={categories} />}
      {taskToView && <TaskDetailModal task={taskToView} onClose={() => setTaskToView(null)} projects={projects} categories={categories} />}
      {showConfetti && <Confetti />}
      {holidayToView && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setHolidayToView(null)}>
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3 mb-4">
                      <i className={`fa-solid fa-gift text-3xl ${holidayToView.country === 'RU' ? 'text-blue-600 dark:text-blue-400' : 'text-cyan-500 dark:text-cyan-400'}`}></i>
                      <div>
                          <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{holidayToView.name}</h3>
                          {holidayToView.isPublic && <p className="text-sm font-semibold text-red-600 dark:text-red-400">Государственный выходной</p>}
                      </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2 text-zinc-600 dark:text-zinc-300">
                      {isHolidayLoading ? <p className="animate-pulse">Загрузка описания...</p> : <p style={{ whiteSpace: 'pre-wrap' }}>{holidayDescription}</p>}
                  </div>
                    <button onClick={() => setHolidayToView(null)} className="mt-6 w-full py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm">
                      Понятно
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
