import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OsDesktop } from './components/OsDesktop';
import { OsTaskbar } from './components/OsTaskbar';
import { ExternalBrainApp } from './components/ExternalBrainApp';
import { FinanceApp } from './components/FinanceApp';
import { KanbanApp } from './components/KanbanApp';
import { CrmApp } from './components/CrmApp';
import { PersonalizationApp } from './components/PersonalizationApp';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { FocusBar } from './components/FocusBar';
import { Confetti } from './components/Confetti';
import { CommandPalette } from './components/CommandPalette';
import { Logo } from './components/Logo';
import { NotificationsCenter } from './components/NotificationsCenter';
import { Task, Project, Idea, Review, Category, TaskPriority, StreakData, Holiday, Employee, View, WindowInstance, KnowledgeNote, Transaction, FinanceCategory, Account, WidgetInstance, WidgetDefinition, Settings, Contact, FinancialGoal, Notification } from './types';
import { APPLICATIONS } from './constants';
import * as dbService from './services/dbService';
import { getNextDueDate, getTasksForDate } from './services/taskService';
import { getHolidayDescription } from './services/geminiService';
import { isSameDay } from './utils/dateUtils';

type ModalState = {
  mode: 'new' | 'edit';
  data?: Task;
  prefill?: Partial<Task>;
};

const findNextAvailablePosition = (widgets: WidgetInstance[], newWidgetSize: { width: number; height: number }): { x: number; y: number } => {
    const PADDING = 20, GAP = 20, TASKBAR_HEIGHT = 48, STANDARD_COLUMN_WIDTH = 220;
    const desktopWidth = window.innerWidth, desktopHeight = window.innerHeight - TASKBAR_HEIGHT;
    const getWidgetRect = (widget: WidgetInstance) => ({ x: widget.position.x, y: widget.position.y, width: typeof widget.size.width === 'number' ? widget.size.width : parseInt(widget.size.width, 10), height: typeof widget.size.height === 'number' ? widget.size.height : parseInt(widget.size.height, 10) });
    const existingRects = widgets.map(getWidgetRect);
    const doesOverlap = (newRect: { x: number; y: number; width: number; height: number }) => {
        for (const existingRect of existingRects) { if (newRect.x < existingRect.x + existingRect.width + GAP && newRect.x + newRect.width + GAP > existingRect.x && newRect.y < existingRect.y + existingRect.height + GAP && newRect.y + newRect.height + GAP > existingRect.y) return existingRect; } return null; };
    let x = desktopWidth - STANDARD_COLUMN_WIDTH - PADDING;
    while (x >= PADDING) {
        let y = PADDING;
        for (let i = 0; i < 100; i++) {
            if (y + newWidgetSize.height + PADDING > desktopHeight) break;
            const newRect = { x, y, width: newWidgetSize.width, height: newWidgetSize.height };
            const overlappingRect = doesOverlap(newRect);
            if (!overlappingRect) return { x, y };
            y = overlappingRect.y + overlappingRect.height + GAP;
        }
        x -= (STANDARD_COLUMN_WIDTH + GAP);
    }
    return { x: PADDING + (widgets.length % 5) * 40, y: PADDING + (widgets.length % 5) * 40 };
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [knowledgeNotes, setKnowledgeNotes] = useState<KnowledgeNote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  
  // Settings & UI State
  const [settings, setSettings] = useState<Settings | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastCompletedDate: '' });
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Widget System State
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [isDesktopEditing, setIsDesktopEditing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        await dbService.initDB();
        const loadedAccounts = await dbService.getAccounts();
        setAccounts(loadedAccounts);
        setTasks(await dbService.getTasks());
        setProjects(await dbService.getProjects());
        setIdeas(await dbService.getIdeas());
        setReviews(await dbService.getReviews());
        setCategories(await dbService.getCategories());
        setEmployees(await dbService.getEmployees());
        setKnowledgeNotes(await dbService.getKnowledgeNotes());
        setTransactions(await dbService.getTransactions());
        setFinanceCategories(await dbService.getFinanceCategories());
        setContacts(await dbService.getContacts());
        setFinancialGoals(await dbService.getFinancialGoals(loadedAccounts));
        setWidgets(await dbService.getWidgets());
        setSettings(await dbService.getSetting('settings', { theme: 'system', weekendDays: [0, 6], accentColor: '#8b5cf6', wallpaper: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop' }));
        setStreakData(await dbService.getSetting('streak', { currentStreak: 0, longestStreak: 0, lastCompletedDate: '' }));
        setIsLoading(false);
    };
    loadData();
  }, []);

  const addNotification = (message: string, icon: string) => {
    const newNotification: Notification = { id: `notif-${Date.now()}`, message, icon, timestamp: new Date(), isRead: false };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(p => !p); }
      if (e.key === 'Escape') { setIsCommandPaletteOpen(false); setIsDesktopEditing(false); setShowNotifications(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (holidayToView) {
        const fetchDescription = async () => { setIsHolidayLoading(true); const result = await getHolidayDescription(holidayToView.name, holidayToView.country); setHolidayDescription(result.description); setIsHolidayLoading(false); };
        fetchDescription();
    }
  }, [holidayToView]);

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    const { theme, accentColor, wallpaper } = settings;
    // Theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => { if (theme === 'system') root.classList.toggle('dark', e.matches); };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    if (theme === 'light') root.classList.remove('dark');
    else if (theme === 'dark') root.classList.add('dark');
    else root.classList.toggle('dark', mediaQuery.matches);
    // Accent Color
    const hexToRgb = (hex: string) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null; };
    const rgb = hexToRgb(accentColor);
    if(rgb) {
        root.style.setProperty('--accent-color-rgb', rgb);
        root.style.setProperty('--accent-color', accentColor);
        // This is a simplified way to generate shades. A more advanced library could be used.
        root.style.setProperty('--accent-color-500', accentColor);
        root.style.setProperty('--accent-color-600', accentColor); // Example
        root.style.setProperty('--accent-color-100', `rgba(${rgb}, 0.1)`);
        root.style.setProperty('--accent-color-50', `rgba(${rgb}, 0.05)`);
    }
    // Wallpaper
    root.style.setProperty('--wallpaper-url', `url('${wallpaper}')`);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [settings]);
  
   useEffect(() => {
    const { dueToday, completedToday } = getTasksForDate(tasks, new Date());
    if (dueToday.length === 0 && completedToday.length > 0 && !showConfetti) {
        const justCompleted = completedToday.some(t => (new Date().getTime() - (t.completedAt ? new Date(t.completedAt).getTime() : 0)) < 2000);
        if (justCompleted) {
            addNotification('Все задачи на сегодня выполнены!', 'fa-check-circle');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }
  }, [tasks, showConfetti]);

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings!, ...newSettings };
    setSettings(updatedSettings);
    await dbService.saveSetting('settings', updatedSettings);
  };

  const handleSaveTask = async (task: Task) => {
    await dbService.saveTask(task);
    setTasks(await dbService.getTasks());
    addNotification(`Задача "${task.title}" сохранена.`, 'fa-save');
    setModalState(null);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    await dbService.deleteTask(taskId);
    setTasks(await dbService.getTasks());
    if (taskToDelete) addNotification(`Задача "${taskToDelete.title}" удалена.`, 'fa-trash');
    setModalState(null);
    setTaskToView(null);
  };
    
  const isWeekend = (date: Date) => settings?.weekendDays.includes(date.getDay());

  const updateStreak = async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0); const todayStr = today.toDateString(); let newStreakData = { ...streakData };
      if (newStreakData.lastCompletedDate === todayStr) return;
      if (!newStreakData.lastCompletedDate) { newStreakData = { currentStreak: 1, longestStreak: Math.max(newStreakData.longestStreak, 1), lastCompletedDate: todayStr }; } else {
        const lastCompleted = new Date(newStreakData.lastCompletedDate); const diffDays = Math.round((today.getTime() - lastCompleted.getTime()) / (1000 * 3600 * 24)); if (diffDays <= 0) return; let isContinuous = true;
        if (diffDays > 1) { for (let i = 1; i < diffDays; i++) { const checkDate = new Date(lastCompleted); checkDate.setDate(lastCompleted.getDate() + i); if (!isWeekend(checkDate)) { isContinuous = false; break; } } }
        if (isContinuous) { const newStreak = newStreakData.currentStreak + 1; newStreakData = { currentStreak: newStreak, longestStreak: Math.max(newStreakData.longestStreak, newStreak), lastCompletedDate: todayStr }; } else { newStreakData = { currentStreak: 1, longestStreak: Math.max(newStreakData.longestStreak, 1), lastCompletedDate: todayStr }; } }
      if (newStreakData.currentStreak > streakData.currentStreak) addNotification(`Вы продлили свой стрик до ${newStreakData.currentStreak} дней!`, 'fa-fire');
      setStreakData(newStreakData); await dbService.saveSetting('streak', newStreakData);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const taskToUpdate = tasks.find(t => t.id === updatedTask.id);
    if (!taskToUpdate) return;
    if (updatedTask.isDone && !taskToUpdate.isDone) {
        await updateStreak();
        if (updatedTask.recurrence && updatedTask.deadline) { const nextDueDate = getNextDueDate(new Date(updatedTask.deadline), updatedTask.recurrence); await dbService.saveTask({ ...updatedTask, isDone: false, deadline: nextDueDate, completedAt: undefined });
        } else { await dbService.saveTask(updatedTask); }
        addNotification(`Задача "${updatedTask.title}" выполнена!`, 'fa-check');
    } else { await dbService.saveTask(updatedTask); }
    setTasks(await dbService.getTasks());
  };
    
  const handlePostponeTask = (taskId: string) => { const task = tasks.find(t => t.id === taskId); if (task) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); if (task.deadline) { tomorrow.setHours(new Date(task.deadline).getHours(), new Date(task.deadline).getMinutes()); } handleUpdateTask({ ...task, deadline: tomorrow }); } };
  const handleSaveReview = async (aiSummary: string) => { const today = new Date(); today.setHours(0, 0, 0, 0); const existingReview = reviews.find(r => isSameDay(r.date, today)); const reviewData = existingReview ? { ...existingReview, aiSummary } : { id: `r${Date.now()}`, date: today, aiSummary, userNotes: '' }; await dbService.saveReview(reviewData); setReviews(await dbService.getReviews()); };
  const handleUpdateReviewNotes = async (reviewId: string, notes: string) => { const review = reviews.find(r => r.id === reviewId); if(review) { await dbService.saveReview({...review, userNotes: notes}); setReviews(await dbService.getReviews()); } }
  const handleAddReview = async (notes: string, mood: Review['mood']) => { const newReview: Review = { id: `r${Date.now()}`, date: new Date(), aiSummary: '', userNotes: notes, mood }; await dbService.saveReview(newReview); setReviews(await dbService.getReviews()); };
  const handleUpdateReviewMood = async (reviewId: string, mood: Review['mood']) => { const review = reviews.find(r => r.id === reviewId); if(review) { await dbService.saveReview({...review, mood }); setReviews(await dbService.getReviews()); } };
  const handleAddIdea = async (text: string) => { const newIdea: Idea = { id: `i${Date.now()}`, text, createdAt: new Date() }; await dbService.saveIdea(newIdea); setIdeas(await dbService.getIdeas()); }
  const handleConvertToTask = async (idea: Idea) => { handleOpenModal('new', undefined, { title: idea.text }); await dbService.deleteIdea(idea.id); setIdeas(ideas.filter(i => i.id !== idea.id)); }
  const handleSetFocusTask = (task: Task) => { if (Notification.permission !== "granted") Notification.requestPermission(); setFocusTask(task); }
  const handleSaveKnowledgeNote = async (note: KnowledgeNote) => { await dbService.saveKnowledgeNote(note); setKnowledgeNotes(await dbService.getKnowledgeNotes()); };
  const handleDeleteKnowledgeNote = async (noteId: string) => { await dbService.deleteKnowledgeNote(noteId); setKnowledgeNotes(await dbService.getKnowledgeNotes()); };
  const handleSaveTransaction = async (transaction: Transaction) => { await dbService.saveTransaction(transaction); const updatedTransactions = await dbService.getTransactions(); setTransactions(updatedTransactions); await dbService.updateAccountBalances(updatedTransactions); setAccounts(await dbService.getAccounts()); };
  const handleSaveMultipleTransactions = async (newTransactions: Transaction[]) => { for (const transaction of newTransactions) { await dbService.saveTransaction(transaction); } const updatedTransactions = await dbService.getTransactions(); setTransactions(updatedTransactions); await dbService.updateAccountBalances(updatedTransactions); setAccounts(await dbService.getAccounts()); };
  const handleDeleteTransaction = async (transactionId: string) => { await dbService.deleteTransaction(transactionId); const updatedTransactions = await dbService.getTransactions(); setTransactions(updatedTransactions); await dbService.updateAccountBalances(updatedTransactions); setAccounts(await dbService.getAccounts()); };
  const handleSaveContact = async (contact: Contact) => { await dbService.saveContact(contact); setContacts(await dbService.getContacts()); };
  const handleDeleteContact = async (contactId: string) => { await dbService.deleteContact(contactId); setContacts(await dbService.getContacts()); };
  const handleSaveFinancialGoal = async (goal: Omit<FinancialGoal, 'currentAmount'>) => { await dbService.saveFinancialGoal(goal); setFinancialGoals(await dbService.getFinancialGoals(accounts)); };
  const handleDeleteFinancialGoal = async (goalId: string) => { await dbService.deleteFinancialGoal(goalId); setFinancialGoals(await dbService.getFinancialGoals(accounts)); };
  const handleOpenModal = (mode: 'new' | 'edit', data?: Task, prefill?: Partial<Task>) => setModalState({ mode, data, prefill });
  const handleViewTask = (task: Task) => setTaskToView(task);
  const handleSaveProject = async (project: Project) => { await dbService.saveProject(project); setProjects(await dbService.getProjects()); };
  const handleDeleteProject = async (projectId: string) => { await dbService.deleteProject(projectId); setProjects(await dbService.getProjects()); setTasks(await dbService.getTasks()); };
  const handleSaveCategory = async (category: Category) => { await dbService.saveCategory(category); setCategories(await dbService.getCategories()); };
  const handleDeleteCategory = async (categoryId: string) => { await dbService.deleteCategory(categoryId); setCategories(await dbService.getCategories()); setTasks(await dbService.getTasks()); };
  const handleResetData = async () => { await dbService.resetAllData(); window.location.reload(); };

  const focusWindow = useCallback((id: string) => { zIndexCounter.current += 1; setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: zIndexCounter.current, isMinimized: false } : w)); }, []);
  const openApp = useCallback((appId: View, initialSubView?: View) => {
    const existingWindow = windows.find(w => w.appId === appId && !w.isMinimized); if (existingWindow) { focusWindow(existingWindow.id); return; }
    const minimizedWindow = windows.find(w => w.appId === appId && w.isMinimized); if(minimizedWindow) { focusWindow(minimizedWindow.id); return; }
    const appDef = APPLICATIONS.find(app => app.id === appId); if (!appDef) return;
    zIndexCounter.current += 1;
    const windowWidth = typeof appDef.defaultSize.width === 'string' ? parseInt(appDef.defaultSize.width, 10) : appDef.defaultSize.width; const windowHeight = typeof appDef.defaultSize.height === 'string' ? parseInt(appDef.defaultSize.height, 10) : appDef.defaultSize.height; const centerX = (window.innerWidth - windowWidth) / 2; const centerY = (window.innerHeight - 48 - windowHeight) / 2; const openWindowsCount = windows.filter(w => !w.isMinimized).length; const offsetX = centerX + (openWindowsCount % 10) * 30; const offsetY = centerY + (openWindowsCount % 10) * 30;
    const newWindow: WindowInstance = { id: `win-${Date.now()}`, appId, zIndex: zIndexCounter.current, isMinimized: false, isMaximized: false, position: { x: Math.max(20, offsetX), y: Math.max(20, offsetY) }, size: appDef.defaultSize, initialSubView: initialSubView, };
    setWindows(prev => [...prev, newWindow]);
  }, [windows, focusWindow]);
  const closeApp = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));
  const minimizeWindow = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  const maximizeWindow = (id: string) => { setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)); focusWindow(id); }
  const handleDragStop = (id: string, pos: { x: number, y: number }) => setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  const handleResizeStop = (id: string, size: { width: number | string, height: number | string }, pos: { x: number, y: number }) => setWindows(prev => prev.map(w => w.id === id ? { ...w, size, position: pos } : w));

  const handleAddWidget = async (widgetDef: WidgetDefinition) => { const position = findNextAvailablePosition(widgets, widgetDef.defaultSize); const newWidget: WidgetInstance = { id: `widget-${Date.now()}`, type: widgetDef.type, position: position, size: widgetDef.defaultSize, }; await dbService.saveWidget(newWidget); setWidgets(prev => [...prev, newWidget]); };
  const handleRemoveWidget = async (widgetId: string) => { await dbService.deleteWidget(widgetId); setWidgets(prev => prev.filter(w => w.id !== widgetId)); };
  const handleUpdateWidget = async (updatedWidget: WidgetInstance) => { await dbService.saveWidget(updatedWidget); setWidgets(prev => prev.map(w => w.id === updatedWidget.id ? updatedWidget : w)); };

  const getFilteredTasks = () => { if (!isBurntOutMode) return tasks; const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH && !t.isDone); if (highPriority.length > 0) return highPriority.slice(0, 1); const nonDone = tasks.filter(t => !t.isDone); return nonDone.length > 0 ? nonDone.slice(0, 1) : []; };

  const renderApp = (instance: WindowInstance) => {
    switch (instance.appId) {
      case 'external-brain': return <ExternalBrainApp onOpenApp={openApp} initialView={instance.initialSubView || 'ai-task-creation'} tasks={getFilteredTasks()} projects={projects} categories={categories} employees={employees} ideas={ideas} reviews={reviews} streakData={streakData} weekendDays={settings?.weekendDays || []} notes={knowledgeNotes} onUpdateTask={handleUpdateTask} onSetFocusTask={handleSetFocusTask} onEditTask={(task: Task) => handleOpenModal('edit', task)} onViewTask={handleViewTask} onPostponeTask={handlePostponeTask} onAddTask={handleSaveTask} onSaveReview={handleSaveReview} onViewHoliday={setHolidayToView} onAddIdea={handleAddIdea} onConvertToTask={handleConvertToTask} onUpdateNotes={handleUpdateReviewNotes} onAddReview={handleAddReview} onUpdateMood={handleUpdateReviewMood} onOpenModal={handleOpenModal} onSaveNote={handleSaveKnowledgeNote} onDeleteNote={handleDeleteKnowledgeNote} onSaveProject={handleSaveProject} onDeleteProject={handleDeleteProject} onSaveCategory={handleSaveCategory} onDeleteCategory={handleDeleteCategory} onUpdateWeekendDays={(days) => handleUpdateSettings({ weekendDays: days })} onResetData={handleResetData} isBurntOutMode={isBurntOutMode} onSetBurntOutMode={setIsBurntOutMode} />;
      case 'finance': return <FinanceApp transactions={transactions} categories={financeCategories} accounts={accounts} onSaveTransaction={handleSaveTransaction} onSaveMultipleTransactions={handleSaveMultipleTransactions} onDeleteTransaction={handleDeleteTransaction} goals={financialGoals} onSaveGoal={handleSaveFinancialGoal} onDeleteGoal={handleDeleteFinancialGoal} />;
      case 'kanban': return <KanbanApp tasks={tasks} projects={projects} onUpdateTask={handleUpdateTask} />;
      case 'crm': return <CrmApp contacts={contacts} onSaveContact={handleSaveContact} onDeleteContact={handleDeleteContact} />;
      case 'personalization': return <PersonalizationApp settings={settings!} onUpdateSettings={handleUpdateSettings} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Logo className="w-16 h-16 text-violet-500 mx-auto animate-pulse" />
          <h1 className="text-xl font-bold mt-4 text-slate-800 dark:text-slate-100">Загрузка WASEWORM OC...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen desktop-bg transition-all duration-500 overflow-hidden">
      <OsDesktop windows={windows} renderApp={renderApp} openApp={openApp} onClose={closeApp} onFocus={focusWindow} onMinimize={minimizeWindow} onMaximize={maximizeWindow} onDragStop={handleDragStop} onResizeStop={handleResizeStop} widgets={widgets} isDesktopEditing={isDesktopEditing} onAddWidget={handleAddWidget} onRemoveWidget={handleRemoveWidget} onUpdateWidget={handleUpdateWidget} tasks={tasks} projects={projects} categories={categories} employees={employees} accounts={accounts} streakData={streakData} onAddTask={handleSaveTask} onOpenNewTask={() => handleOpenModal('new')} onUpdateTask={handleUpdateTask} transactions={transactions} />
      <OsTaskbar windows={windows} openApp={openApp} focusWindow={focusWindow} streakData={streakData} settings={settings!} onUpdateSettings={handleUpdateSettings} onOpenNewTask={() => handleOpenModal('new')} isDesktopEditing={isDesktopEditing} onSetDesktopEditing={setIsDesktopEditing} onToggleNotifications={() => setShowNotifications(p => !p)} unreadCount={notifications.filter(n => !n.isRead).length} />
      {focusTask && <FocusBar task={focusTask} onClose={() => setFocusTask(null)} onTaskComplete={(taskId) => { const t = tasks.find(t => t.id === taskId); if(t) handleUpdateTask({ ...t, isDone: true, completedAt: new Date() }); }} />}
      {modalState && <TaskModal initialState={modalState} onClose={() => setModalState(null)} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} projects={projects} categories={categories} />}
      {taskToView && <TaskDetailModal task={taskToView} onClose={() => setTaskToView(null)} projects={projects} categories={categories} />}
      {isCommandPaletteOpen && <CommandPalette onClose={() => setIsCommandPaletteOpen(false)} openApp={openApp} tasks={tasks} projects={projects} onEditTask={(task) => handleOpenModal('edit', task)} onNewTask={() => handleOpenModal('new')} />}
      {showConfetti && <Confetti />}
      {showNotifications && <NotificationsCenter notifications={notifications} onClose={() => setShowNotifications(false)} onClear={() => setNotifications([])} />}
      {holidayToView && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setHolidayToView(null)}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3 mb-4"> <i className={`fa-solid fa-gift text-3xl ${holidayToView.country === 'RU' ? 'text-blue-600 dark:text-blue-400' : 'text-cyan-500 dark:text-cyan-400'}`}></i> <div> <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{holidayToView.name}</h3> {holidayToView.isPublic && <p className="text-sm font-semibold text-red-600 dark:text-red-400">Государственный выходной</p>} </div> </div>
                  <div className="max-h-60 overflow-y-auto pr-2 text-slate-600 dark:text-slate-300"> {isHolidayLoading ? <p className="animate-pulse">Загрузка описания...</p> : <p style={{ whiteSpace: 'pre-wrap' }}>{holidayDescription}</p>} </div>
                    <button onClick={() => setHolidayToView(null)} className="mt-6 w-full py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm"> Понятно </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;