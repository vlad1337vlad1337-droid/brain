import { Task, Project, Idea, Review, Category, StreakData, Employee, KnowledgeNote, Transaction, FinanceCategory, Account, WidgetInstance, WidgetType, Settings, Contact, FinancialGoal } from '../types';
import { TASKS, PROJECTS, IDEAS, DEFAULT_CATEGORIES, EMPLOYEES, DEFAULT_FINANCE_CATEGORIES, DEFAULT_ACCOUNTS } from '../constants';

declare const initSqlJs: any;

// This is a singleton instance of the database
let db: any = null;

const DB_NAME = 'external-brain-db';
const DB_STORE_NAME = 'sqlite-db';

// Helper to save the database file to IndexedDB
const saveDbToIndexedDB = async () => {
  if (!db) return;
  const dbData = db.export();
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = () => {
    const idb = request.result;
    if (!idb.objectStoreNames.contains(DB_STORE_NAME)) {
      idb.createObjectStore(DB_STORE_NAME);
    }
  };

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction(DB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(DB_STORE_NAME);
      store.put(dbData, 'db');
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = (event) => reject(event);
    };
    request.onerror = (event) => reject(event);
  });
};

// Helper to load the database file from IndexedDB
const loadDbFromIndexedDB = async (): Promise<Uint8Array | null> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const idb = request.result;
            if (!idb.objectStoreNames.contains(DB_STORE_NAME)) {
                idb.createObjectStore(DB_STORE_NAME);
            }
        };

        request.onsuccess = () => {
            const idb = request.result;
            if (!idb.objectStoreNames.contains(DB_STORE_NAME)) {
                resolve(null);
                return;
            }
            const transaction = idb.transaction(DB_STORE_NAME, 'readonly');
            const store = transaction.objectStore(DB_STORE_NAME);
            const getRequest = store.get('db');

            getRequest.onsuccess = () => {
                resolve(getRequest.result ? new Uint8Array(getRequest.result) : null);
            };
            getRequest.onerror = (event) => reject(event);
        };
        request.onerror = (event) => reject(event);
    });
};

const createSchema = () => {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      isDone INTEGER,
      priority TEXT,
      deadline TEXT,
      completedAt TEXT,
      projectId TEXT,
      categoryId TEXT,
      recurrence TEXT,
      timeOfDay TEXT,
      assignedTo TEXT,
      originalText TEXT,
      durationMinutes INTEGER,
      kanbanColumnId TEXT
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      aiSummary TEXT,
      userNotes TEXT,
      mood TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        color TEXT
    );
    CREATE TABLE IF NOT EXISTS knowledge_notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        createdAt TEXT,
        updatedAt TEXT
    );
     CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL NOT NULL,
        type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        categoryId TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        accountId TEXT NOT NULL,
        recurrence TEXT
    );
    CREATE TABLE IF NOT EXISTS finance_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS widgets (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      x INTEGER,
      y INTEGER,
      width TEXT,
      height TEXT,
      config TEXT
    );
    CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        notes TEXT,
        createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS financial_goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        createdAt TEXT
    );
  `);
};

const seedDatabase = () => {
    if (!db) return;
    const taskStmt = db.prepare("INSERT INTO tasks (id, title, isDone, priority, deadline, completedAt, projectId, categoryId, recurrence, timeOfDay, assignedTo, kanbanColumnId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    TASKS.forEach(t => taskStmt.run([
        t.id, 
        t.title, 
        t.isDone ? 1 : 0, 
        t.priority, 
        t.deadline?.toISOString() ?? null,
        t.completedAt?.toISOString() ?? null,
        t.projectId ?? null,
        t.categoryId ?? null,
        t.recurrence ?? null,
        t.timeOfDay ?? null,
        t.assignedTo ?? null,
        t.kanbanColumnId ?? 'backlog',
    ]));
    taskStmt.free();

    const projectStmt = db.prepare("INSERT INTO projects (id, name, icon, color) VALUES (?, ?, ?, ?)");
    PROJECTS.forEach(p => projectStmt.run([p.id, p.name, p.icon ?? null, p.color ?? null]));
    projectStmt.free();
    
    const employeeStmt = db.prepare("INSERT INTO employees (id, name, avatar, color) VALUES (?, ?, ?, ?)");
    EMPLOYEES.forEach(e => employeeStmt.run([e.id, e.name, e.avatar ?? null, e.color ?? null]));
    employeeStmt.free();

    const categoryStmt = db.prepare("INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)");
    DEFAULT_CATEGORIES.forEach(c => categoryStmt.run([c.id, c.name, c.icon ?? null, c.color ?? null]));
    categoryStmt.free();

    const financeCategoryStmt = db.prepare("INSERT INTO finance_categories (id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)");
    DEFAULT_FINANCE_CATEGORIES.forEach(fc => financeCategoryStmt.run([fc.id, fc.name, fc.icon, fc.color, fc.type]));
    financeCategoryStmt.free();

    const accountStmt = db.prepare("INSERT INTO accounts (id, name, balance, type) VALUES (?, ?, ?, ?)");
    DEFAULT_ACCOUNTS.forEach(acc => accountStmt.run([acc.id, acc.name, acc.balance, acc.type]));
    accountStmt.free();
    
    const ideaStmt = db.prepare("INSERT INTO ideas (id, text, createdAt) VALUES (?, ?, ?)");
    IDEAS.forEach(i => ideaStmt.run([i.id, i.text, i.createdAt.toISOString()]));
    ideaStmt.free();

    const settingsStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    const defaultSettings: Settings = {
        theme: 'system',
        weekendDays: [0, 6],
        accentColor: '#8b5cf6',
        wallpaper: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop'
    }
    settingsStmt.run(['settings', JSON.stringify(defaultSettings)]);
    settingsStmt.run(['streak', JSON.stringify({ currentStreak: 0, longestStreak: 0, lastCompletedDate: '' })]);
    settingsStmt.free();
};

const migrateFromLocalStorage = async (): Promise<boolean> => {
    // This is a legacy migration path that is no longer needed for new features,
    // but kept for users who might have old localStorage data.
    return false;
};


const mapRowTo = <T,>(keys: (keyof T)[], row: any[]): T => {
    const obj: any = {};
    keys.forEach((key, index) => {
        obj[key] = row[index];
    });
    return obj as T;
};

// Public API
export const initDB = async () => {
  if (db) return;
  try {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    const dbData = await loadDbFromIndexedDB();
    if (dbData && dbData.length > 0) {
        db = new SQL.Database(dbData);
        createSchema();
    } else {
        db = new SQL.Database();
        createSchema();
        seedDatabase();
        await saveDbToIndexedDB();
    }
  } catch (err) {
      console.error("Не удалось инициализировать базу данных:", err);
  }
};

export const resetAllData = async () => {
    if (!db) return;
    const tables = ['tasks', 'projects', 'categories', 'ideas', 'reviews', 'employees', 'settings', 'knowledge_notes', 'transactions', 'finance_categories', 'accounts', 'widgets', 'contacts', 'financial_goals'];
    for (const table of tables) {
      db.run(`DELETE FROM ${table}`);
    }
    seedDatabase();
    await saveDbToIndexedDB();
};

// Generic Saver
const saveItem = async (tableName: string, item: any) => {
    if (!db) return;
    const keys = Object.keys(item).filter(k => item[k] !== undefined);
    const values = keys.map(k => item[k]);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`);
    stmt.run(values.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v instanceof Date ? v.toISOString() : v));
    stmt.free();
    await saveDbToIndexedDB();
};

// Generic Deleter
const deleteItem = async (tableName: string, id: string) => {
    if (!db) return;
    db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    if(tableName === 'projects' || tableName === 'categories') {
        const field = tableName === 'projects' ? 'projectId' : 'categoryId';
        db.run(`UPDATE tasks SET ${field} = NULL WHERE ${field} = ?`, [id]);
    }
    await saveDbToIndexedDB();
};

// Generic Getters
const getItems = <T,>(tableName: string, mapper: (row: any[]) => T): T[] => {
    if (!db) return [];
    const res = db.exec(`SELECT * FROM ${tableName}`);
    if (!res[0]) return [];
    return res[0].values.map(mapper);
};

// Mappers
const taskKeys: (keyof Task)[] = ['id', 'title', 'isDone', 'priority', 'deadline', 'completedAt', 'projectId', 'categoryId', 'recurrence', 'timeOfDay', 'assignedTo', 'originalText', 'durationMinutes', 'kanbanColumnId'];
const mapRowToTask = (row: any[]): Task => ({ ...mapRowTo<any>(taskKeys, row), isDone: !!row[2], deadline: row[4] ? new Date(row[4]) : undefined, completedAt: row[5] ? new Date(row[5]) : undefined });
const projectKeys: (keyof Project)[] = ['id', 'name', 'icon', 'color'];
const mapRowToProject = (row: any[]): Project => mapRowTo<Project>(projectKeys, row);
const employeeKeys: (keyof Employee)[] = ['id', 'name', 'avatar', 'color'];
const mapRowToEmployee = (row: any[]): Employee => mapRowTo<Employee>(employeeKeys, row);
const categoryKeys: (keyof Category)[] = ['id', 'name', 'icon', 'color'];
const mapRowToCategory = (row: any[]): Category => mapRowTo<Category>(categoryKeys, row);
const ideaKeys: (keyof Idea)[] = ['id', 'text', 'createdAt'];
const mapRowToIdea = (row: any[]): Idea => ({ ...mapRowTo<any>(ideaKeys, row), createdAt: new Date(row[2]) });
const reviewKeys: (keyof Review)[] = ['id', 'date', 'aiSummary', 'userNotes', 'mood'];
const mapRowToReview = (row: any[]): Review => ({ ...mapRowTo<any>(reviewKeys, row), date: new Date(row[1]) });
const noteKeys: (keyof KnowledgeNote)[] = ['id', 'title', 'content', 'createdAt', 'updatedAt'];
const mapRowToKnowledgeNote = (row: any[]): KnowledgeNote => ({ ...mapRowTo<any>(noteKeys, row), createdAt: new Date(row[3]), updatedAt: new Date(row[4]) });
const accountKeys: (keyof Account)[] = ['id', 'name', 'balance', 'type'];
const mapRowToAccount = (row: any[]): Account => mapRowTo<Account>(accountKeys, row);
const transactionKeys: (keyof Transaction)[] = ['id', 'amount', 'type', 'categoryId', 'date', 'description', 'accountId', 'recurrence'];
const mapRowToTransaction = (row: any[]): Transaction => ({ ...mapRowTo<any>(transactionKeys, row), date: new Date(row[4]) });
const financeCategoryKeys: (keyof FinanceCategory)[] = ['id', 'name', 'icon', 'color', 'type'];
const mapRowToFinanceCategory = (row: any[]): FinanceCategory => mapRowTo<FinanceCategory>(financeCategoryKeys, row);
const widgetKeys: (keyof Omit<WidgetInstance, 'position' | 'size' | 'config'>)[] = ['id', 'type'];
const mapRowToWidget = (row: any[]): WidgetInstance => ({ id: row[0], type: row[1] as WidgetType, position: { x: row[2], y: row[3] }, size: { width: row[4], height: row[5] }, config: row[6] ? JSON.parse(row[6]) : undefined });
const contactKeys: (keyof Contact)[] = ['id', 'name', 'company', 'email', 'phone', 'notes', 'createdAt'];
const mapRowToContact = (row: any[]): Contact => ({...mapRowTo<any>(contactKeys, row), createdAt: new Date(row[6]) });
const goalKeys: (keyof Omit<FinancialGoal, 'currentAmount'>)[] = ['id', 'name', 'targetAmount', 'createdAt'];
const mapRowToFinancialGoal = (row: any[]): Omit<FinancialGoal, 'currentAmount'> => ({ ...mapRowTo<any>(goalKeys, row), createdAt: new Date(row[3]) });

// Public API for each type
export const getTasks = async (): Promise<Task[]> => getItems('tasks', mapRowToTask);
export const saveTask = async (task: Task) => saveItem('tasks', task);
export const deleteTask = async (taskId: string) => deleteItem('tasks', taskId);

export const getProjects = async (): Promise<Project[]> => getItems('projects', mapRowToProject);
export const saveProject = async (project: Project) => saveItem('projects', project);
export const deleteProject = async (projectId: string) => deleteItem('projects', projectId);

export const getEmployees = async (): Promise<Employee[]> => getItems('employees', mapRowToEmployee);
export const saveEmployee = async (employee: Employee) => saveItem('employees', employee);
export const deleteEmployee = async (employeeId: string) => deleteItem('employees', employeeId);

export const getCategories = async (): Promise<Category[]> => getItems('categories', mapRowToCategory);
export const saveCategory = async (category: Category) => saveItem('categories', category);
export const deleteCategory = async (categoryId: string) => deleteItem('categories', categoryId);

export const getIdeas = async (): Promise<Idea[]> => getItems('ideas', mapRowToIdea);
export const saveIdea = async (idea: Idea) => saveItem('ideas', idea);
export const deleteIdea = async (ideaId: string) => deleteItem('ideas', ideaId);

export const getReviews = async (): Promise<Review[]> => getItems('reviews', mapRowToReview);
export const saveReview = async (review: Review) => saveItem('reviews', review);
export const deleteReview = async (reviewId: string) => deleteItem('reviews', reviewId);

export const getKnowledgeNotes = async (): Promise<KnowledgeNote[]> => getItems('knowledge_notes', mapRowToKnowledgeNote);
export const saveKnowledgeNote = async (note: KnowledgeNote) => saveItem('knowledge_notes', note);
export const deleteKnowledgeNote = async (noteId: string) => deleteItem('knowledge_notes', noteId);

export const getAccounts = async (): Promise<Account[]> => getItems('accounts', mapRowToAccount);
export const saveAccount = async (account: Account) => saveItem('accounts', account);

export const getTransactions = async (): Promise<Transaction[]> => getItems('transactions', mapRowToTransaction);
export const saveTransaction = async (transaction: Transaction) => saveItem('transactions', transaction);
export const deleteTransaction = async (transactionId: string) => deleteItem('transactions', transactionId);

export const getContacts = async (): Promise<Contact[]> => getItems('contacts', mapRowToContact);
export const saveContact = async (contact: Contact) => saveItem('contacts', contact);
export const deleteContact = async (contactId: string) => deleteItem('contacts', contactId);

export const getFinancialGoals = async (accounts: Account[]): Promise<FinancialGoal[]> => {
    const goalsData = getItems('financial_goals', mapRowToFinancialGoal);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return goalsData.map(goal => ({
        ...goal,
        currentAmount: totalBalance // Or a more complex logic based on goal type
    }));
};
export const saveFinancialGoal = async (goal: Omit<FinancialGoal, 'currentAmount'>) => saveItem('financial_goals', goal);
export const deleteFinancialGoal = async (goalId: string) => deleteItem('financial_goals', goalId);


export const updateAccountBalances = async (allTransactions: Transaction[]) => {
    const accounts = await getAccounts();
    const balances = new Map(accounts.map(a => [a.id, 0]));

    allTransactions.forEach(t => {
        let currentBalance = balances.get(t.accountId) || 0;
        if (t.type === 'income') {
            currentBalance += t.amount;
        } else if (t.type === 'expense') {
            currentBalance -= t.amount;
        }
        balances.set(t.accountId, currentBalance);
    });

    for (const account of accounts) {
        const newBalance = balances.get(account.id) || 0;
        if (account.balance !== newBalance) {
            await saveAccount({ ...account, balance: newBalance });
        }
    }
};

export const getFinanceCategories = async (): Promise<FinanceCategory[]> => getItems('finance_categories', mapRowToFinanceCategory);
export const saveFinanceCategory = async (category: FinanceCategory) => saveItem('finance_categories', category);
export const deleteFinanceCategory = async (categoryId: string) => deleteItem('finance_categories', categoryId);

export const saveSetting = async <T,>(key: string, value: T) => {
    if (!db) return;
    const valueStr = JSON.stringify(value);
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, valueStr]);
    await saveDbToIndexedDB();
};

export const getSetting = async <T,>(key: string, defaultValue: T): Promise<T> => {
    if (!db) return defaultValue;
    const res = db.exec(`SELECT value FROM settings WHERE key = '${key}'`);
    if (res.length > 0 && res[0].values.length > 0 && res[0].values[0][0]) {
        try {
            return JSON.parse(res[0].values[0][0]);
        } catch (e) {
            return defaultValue;
        }
    }
    return defaultValue;
};

// Widget DB functions
export const getWidgets = async (): Promise<WidgetInstance[]> => getItems('widgets', mapRowToWidget);
export const saveWidget = async (widget: WidgetInstance) => {
    if (!db) return;
    const stmt = db.prepare(`INSERT OR REPLACE INTO widgets (id, type, x, y, width, height, config) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run([widget.id, widget.type, widget.position.x, widget.position.y, widget.size.width, widget.size.height, widget.config ? JSON.stringify(widget.config) : null]);
    stmt.free();
    await saveDbToIndexedDB();
};
export const deleteWidget = async (widgetId: string) => deleteItem('widgets', widgetId);