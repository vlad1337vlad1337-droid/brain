
import { Task, Project, Idea, TaskPriority, Category, TaskPriorityConfig, Employee, AppDefinition, View } from './types';

export const COLOR_PALETTE = [
  '#f43f5e', // rose-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
];

export const APPLICATIONS: AppDefinition[] = [
  { id: 'today', name: 'Сегодня', icon: 'fa-house', defaultSize: { width: 950, height: 700 } },
  { id: 'calendar', name: 'Календарь', icon: 'fa-calendar', defaultSize: { width: 1200, height: 768 } },
  { id: 'analytics', name: 'Аналитика', icon: 'fa-chart-pie', defaultSize: { width: 1100, height: 750 } },
  { id: 'journal', name: 'Журнал', icon: 'fa-book', defaultSize: { width: 700, height: 800 } },
  { id: 'projects', name: 'Проекты', icon: 'fa-folder-open', defaultSize: { width: 800, height: 700 } },
  { id: 'employees', name: 'Команда', icon: 'fa-users', defaultSize: { width: 1200, height: 700 } },
  { id: 'ideas', name: 'Идеи', icon: 'fa-lightbulb', defaultSize: { width: 700, height: 600 } },
  { id: 'settings', name: 'Настройки', icon: 'fa-gear', defaultSize: { width: 800, height: 750 } },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Компьютер', icon: 'fa-solid fa-laptop', color: COLOR_PALETTE[8] },
  { id: 'c2', name: 'Дом', icon: 'fa-solid fa-house', color: COLOR_PALETTE[4] },
  { id: 'c3', name: 'На улице', icon: 'fa-solid fa-tree', color: COLOR_PALETTE[3] },
  { id: 'c4', name: 'Телефон', icon: 'fa-solid fa-phone', color: COLOR_PALETTE[10] },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Бренд: WASE WORM', icon: 'fa-solid fa-gem', color: COLOR_PALETTE[9] },
  { id: 'p2', name: 'Маркетинг', icon: 'fa-solid fa-bullhorn', color: COLOR_PALETTE[0] },
  { id: 'p3', name: 'Производство', icon: 'fa-solid fa-industry', color: COLOR_PALETTE[1] },
];

export const EMPLOYEES: Employee[] = [
    { id: 'e1', name: 'Алексей', avatar: 'fa-solid fa-user-tie', color: COLOR_PALETTE[8] },
    { id: 'e2', name: 'Мария', avatar: 'fa-solid fa-user-pen', color: COLOR_PALETTE[11] },
];

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Завершить макеты новой коллекции WASE WORM',
    isDone: false,
    priority: TaskPriority.HIGH,
    deadline: new Date(new Date().setDate(new Date().getDate() + 1)),
    projectId: 'p1',
    categoryId: 'c1',
    assignedTo: 'e1',
  },
  {
    id: 't2',
    title: 'Написать черновик письма для запуска продукта',
    isDone: false,
    priority: TaskPriority.MEDIUM,
    deadline: new Date(new Date().setDate(new Date().getDate() + 2)),
    projectId: 'p2',
    categoryId: 'c1',
    assignedTo: 'e2',
  },
  {
    id: 't3',
    title: 'Позвонить китайским поставщикам по материалам для кошельков',
    isDone: false,
    priority: TaskPriority.HIGH,
    deadline: new Date(),
    projectId: 'p3',
    categoryId: 'c4',
    assignedTo: 'e1',
  },
  {
    id: 't4',
    title: 'Проверить контент-план от контент-менеджера',
    isDone: false,
    priority: TaskPriority.MEDIUM,
    projectId: 'p2',
    categoryId: 'c1',
    assignedTo: 'e2',
  },
  {
    id: 't5',
    title: 'Запланировать синхронизацию команды на следующую неделю',
    isDone: false,
    priority: TaskPriority.LOW,
  },
  {
    id: 't6',
    title: 'Оплатить ежемесячные подписки на ПО',
    isDone: true,
    priority: TaskPriority.MEDIUM,
    completedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    deadline: new Date(new Date().setDate(new Date().getDate() - 1)),
    categoryId: 'c1',
    assignedTo: 'e1',
  },
  {
    id: 't7',
    title: 'Прогуляться, чтобы проветрить голову',
    isDone: false,
    priority: TaskPriority.LOW,
    categoryId: 'c3',
  },
  {
    id: 't8',
    title: 'Оплатить кредит',
    isDone: false,
    priority: TaskPriority.HIGH,
    deadline: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    recurrence: 'monthly',
    categoryId: 'c1',
  },
];

export const IDEAS: Idea[] = [
  { id: 'i1', text: 'Концепция нового поп-ап магазина на лето', createdAt: new Date() },
  { id: 'i2', text: 'Сотрудничество с местным художником', createdAt: new Date() },
];

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, TaskPriorityConfig> = {
  [TaskPriority.LOW]: { color: 'bg-blue-500', text: 'Низкий', icon: 'fa-solid fa-flag' },
  [TaskPriority.MEDIUM]: { color: 'bg-yellow-500', text: 'Средний', icon: 'fa-solid fa-layer-group' },
  [TaskPriority.HIGH]: { color: 'bg-red-500', text: 'Высокий', icon: 'fa-solid fa-fire' },
};

export const ICON_LIST = [
    'fa-solid fa-star', 'fa-solid fa-heart', 'fa-solid fa-briefcase', 'fa-solid fa-user',
    'fa-solid fa-users', 'fa-solid fa-comment-dots', 'fa-solid fa-envelope', 'fa-solid fa-phone',
    'fa-solid fa-shopping-cart', 'fa-solid fa-chart-line', 'fa-solid fa-lightbulb', 'fa-solid fa-wrench',
    'fa-solid fa-home', 'fa-solid fa-building', 'fa-solid fa-car', 'fa-solid fa-plane',
    'fa-solid fa-laptop', 'fa-solid fa-mobile-alt', 'fa-solid fa-book', 'fa-solid fa-graduation-cap',
    'fa-solid fa-tree', 'fa-solid fa-utensils', 'fa-solid fa-dumbbell', 'fa-solid fa-music',
    'fa-solid fa-credit-card', 'fa-solid fa-money-bill-wave', 'fa-solid fa-palette', 'fa-solid fa-code',
    'fa-solid fa-folder', 'fa-solid fa-folder-open', 'fa-solid fa-tags', 'fa-solid fa-link',
    'fa-solid fa-paperclip', 'fa-solid fa-bullhorn', 'fa-solid fa-calendar', 'fa-solid fa-clock',
    'fa-solid fa-camera', 'fa-solid fa-video', 'fa-solid fa-microphone', 'fa-solid fa-pen',
    'fa-solid fa-trash', 'fa-solid fa-cog', 'fa-solid fa-globe', 'fa-solid fa-map-marker-alt',
    'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud', 'fa-solid fa-bolt',
    'fa-solid fa-fire', 'fa-solid fa-water', 'fa-solid fa-leaf', 'fa-solid fa-atom',
    'fa-solid fa-rocket', 'fa-solid fa-flag', 'fa-solid fa-trophy', 'fa-solid fa-gift',
    'fa-solid fa-key', 'fa-solid fa-lock', 'fa-solid fa-unlock', 'fa-solid fa-shield-halved',
    'fa-solid fa-bug', 'fa-solid fa-code-branch', 'fa-solid fa-terminal', 'fa-solid fa-database',
    'fa-solid fa-server', 'fa-solid fa-network-wired', 'fa-solid fa-desktop', 'fa-solid fa-tablet-alt',
    'fa-solid fa-gamepad', 'fa-solid fa-puzzle-piece', 'fa-solid fa-dice-d6', 'fa-solid fa-chess-knight',
    'fa-solid fa-handshake', 'fa-solid fa-balance-scale', 'fa-solid fa-gavel', 'fa-solid fa-landmark',
    'fa-solid fa-piggy-bank', 'fa-solid fa-wallet', 'fa-solid fa-file-invoice-dollar', 'fa-solid fa-coins',
    'fa-solid fa-pills', 'fa-solid fa-stethoscope', 'fa-solid fa-heartbeat', 'fa-solid fa-dna',
    'fa-solid fa-flask', 'fa-solid fa-microscope', 'fa-solid fa-seedling', 'fa-solid fa-industry',
    'fa-solid fa-anchor', 'fa-solid fa-ship', 'fa-solid fa-truck', 'fa-solid fa-train',
    'fa-solid fa-gem', 'fa-solid fa-crown', 'fa-solid fa-ghost', 'fa-solid fa-dragon'
];
