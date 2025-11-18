import { Task, Project, Idea, TaskPriority, Category, TaskPriorityConfig, Employee, AppDefinition, View, FinanceCategory, Account, WidgetDefinition, WidgetType } from './types';

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
  { id: 'external-brain', name: 'Внешний мозг', icon: 'fa-wave-square', defaultSize: { width: 1280, height: 800 } },
  { id: 'finance', name: 'Финансы', icon: 'fa-chart-line', defaultSize: { width: 1100, height: 750 } },
  { id: 'kanban', name: 'Kanban доска', icon: 'fa-table-columns', defaultSize: { width: 1200, height: 700 } },
  { id: 'crm', name: 'Контакты (CRM)', icon: 'fa-address-book', defaultSize: { width: 900, height: 600 } },
  { id: 'personalization', name: 'Персонализация', icon: 'fa-palette', defaultSize: { width: 700, height: 550 } },
];

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Бэклог' },
  { id: 'todo', title: 'К выполнению' },
  { id: 'in-progress', title: 'В работе' },
  { id: 'done', title: 'Готово' },
];

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
    { type: WidgetType.CLOCK, name: 'Часы', description: 'Отображает текущее время и дату.', icon: 'fa-clock', defaultSize: { width: 220, height: 120 }, minSize: { width: 200, height: 100 } },
    { type: WidgetType.WEATHER, name: 'Погода', description: 'Показывает текущую погоду.', icon: 'fa-cloud-sun', defaultSize: { width: 220, height: 120 }, minSize: { width: 200, height: 100 } },
    { type: WidgetType.STREAK, name: 'Стрик', description: 'Ваш огонь продуктивности.', icon: 'fa-fire', defaultSize: { width: 220, height: 140 }, minSize: { width: 200, height: 120 } },
    { type: WidgetType.AI_TASK, name: 'Задача с ИИ', description: 'Быстрое создание задачи с помощью ИИ.', icon: 'fa-wand-magic-sparkles', defaultSize: { width: 220, height: 160 }, minSize: { width: 220, height: 160 } },
    { type: WidgetType.AGENDA, name: 'План на сегодня', description: 'Список ваших задач на сегодня.', icon: 'fa-list-check', defaultSize: { width: 220, height: 280 }, minSize: { width: 220, height: 200 } },
    { type: WidgetType.PROJECT_PROGRESS, name: 'Прогресс проекта', description: 'Отслеживайте прогресс по проекту.', icon: 'fa-diagram-project', defaultSize: { width: 220, height: 220 }, minSize: { width: 220, height: 200 } },
    { type: WidgetType.FINANCE_OVERVIEW, name: 'Обзор финансов', description: 'Баланс счета или доходы/расходы.', icon: 'fa-wallet', defaultSize: { width: 220, height: 140 }, minSize: { width: 200, height: 120 } },
    { type: WidgetType.NOTEPAD, name: 'Блокнот', description: 'Для быстрых заметок.', icon: 'fa-note-sticky', defaultSize: { width: 220, height: 220 }, minSize: { width: 220, height: 180 } },
    { type: WidgetType.QUOTE, name: 'Цитата дня', description: 'Ежедневная доза мотивации.', icon: 'fa-quote-left', defaultSize: { width: 220, height: 140 }, minSize: { width: 220, height: 120 } },
];


export const DEFAULT_ACCOUNTS: Account[] = [
    { id: 'acc-designers', name: 'Дизайнеры *2771', balance: 0, type: 'business' },
    { id: 'acc-cdek', name: 'Сдек *0333', balance: 0, type: 'business' },
    { id: 'acc-fot', name: 'ФОТ *6970', balance: 0, type: 'business' },
    { id: 'acc-purchase', name: 'Закупка партий *2603', balance: 0, type: 'business' },
    { id: 'acc-ads', name: 'Реклама *0509', balance: 0, type: 'business' },
    { id: 'acc-salary', name: 'Моя зарплата *5204', balance: 0, type: 'personal' },
    { id: 'acc-credits', name: 'Кредиты *4733', balance: 0, type: 'business' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Компьютер', icon: 'fa-solid fa-laptop', color: COLOR_PALETTE[8] },
  { id: 'c2', name: 'Дом', icon: 'fa-solid fa-house', color: COLOR_PALETTE[4] },
  { id: 'c3', name: 'На улице', icon: 'fa-solid fa-tree', color: COLOR_PALETTE[3] },
  { id: 'c4', name: 'Телефон', icon: 'fa-solid fa-phone', color: COLOR_PALETTE[10] },
];

export const DEFAULT_FINANCE_CATEGORIES: FinanceCategory[] = [
  // Expenses
  { id: 'fc-exp1', name: 'Продукты', icon: 'fa-solid fa-shopping-cart', color: COLOR_PALETTE[4], type: 'expense' },
  { id: 'fc-exp2', name: 'Транспорт', icon: 'fa-solid fa-bus', color: COLOR_PALETTE[8], type: 'expense' },
  { id: 'fc-exp3', name: 'Жилье', icon: 'fa-solid fa-home', color: COLOR_PALETTE[7], type: 'expense' },
  { id: 'fc-exp4', name: 'Развлечения', icon: 'fa-solid fa-film', color: COLOR_PALETTE[10], type: 'expense' },
  { id: 'fc-exp5', name: 'Рестораны', icon: 'fa-solid fa-utensils', color: COLOR_PALETTE[1], type: 'expense' },
  { id: 'fc-exp6', name: 'Здоровье', icon: 'fa-solid fa-heartbeat', color: COLOR_PALETTE[0], type: 'expense' },
  { id: 'fc-exp-transfer', name: 'Перевод на личный счет', icon: 'fa-solid fa-exchange-alt', color: COLOR_PALETTE[11], type: 'expense' },
  // Income
  { id: 'fc-inc1', name: 'Зарплата', icon: 'fa-solid fa-money-bill-wave', color: COLOR_PALETTE[5], type: 'income' },
  { id: 'fc-inc2', name: 'Фриланс', icon: 'fa-solid fa-briefcase', color: COLOR_PALETTE[6], type: 'income' },
  { id: 'fc-inc3', name: 'Кредит', icon: 'fa-solid fa-hand-holding-dollar', color: COLOR_PALETTE[8], type: 'income' },
  { id: 'fc-inc4', name: 'Факторинг', icon: 'fa-solid fa-file-invoice-dollar', color: COLOR_PALETTE[6], type: 'income' },
  { id: 'fc-inc-transfer', name: 'Перевод с бизнес-счета', icon: 'fa-solid fa-exchange-alt', color: COLOR_PALETTE[9], type: 'income' },
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
    kanbanColumnId: 'in-progress',
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
    kanbanColumnId: 'todo',
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
    kanbanColumnId: 'todo',
  },
  {
    id: 't4',
    title: 'Проверить контент-план от контент-менеджера',
    isDone: false,
    priority: TaskPriority.MEDIUM,
    projectId: 'p2',
    categoryId: 'c1',
    assignedTo: 'e2',
    kanbanColumnId: 'backlog',
  },
  {
    id: 't5',
    title: 'Запланировать синхронизацию команды на следующую неделю',
    isDone: false,
    priority: TaskPriority.LOW,
    kanbanColumnId: 'backlog',
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
    kanbanColumnId: 'done',
  },
  {
    id: 't7',
    title: 'Прогуляться, чтобы проветрить голову',
    isDone: false,
    priority: TaskPriority.LOW,
    categoryId: 'c3',
    kanbanColumnId: 'todo',
  },
  {
    id: 't8',
    title: 'Оплатить кредит',
    isDone: false,
    priority: TaskPriority.HIGH,
    deadline: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    recurrence: 'monthly',
    categoryId: 'c1',
    kanbanColumnId: 'todo',
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
    'fa-solid fa-gem', 'fa-solid fa-crown', 'fa-solid fa-ghost', 'fa-solid fa-dragon',
    'fa-solid fa-hand-holding-dollar'
];