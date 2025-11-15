import { Task, Project, Idea, Review, Category, StreakData, Employee } from '../types';
import { TASKS, PROJECTS, IDEAS, DEFAULT_CATEGORIES, EMPLOYEES } from '../constants';

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
    CREATE TABLE tasks (
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
      durationMinutes INTEGER
    );
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );
    CREATE TABLE ideas (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      createdAt TEXT
    );
    CREATE TABLE reviews (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      aiSummary TEXT,
      userNotes TEXT,
      mood TEXT
    );
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        color TEXT
    );
  `);
};

const seedDatabase = () => {
    if (!db) return;
    const taskStmt = db.prepare("INSERT INTO tasks (id, title, isDone, priority, deadline, completedAt, projectId, categoryId, recurrence, timeOfDay, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
    
    const ideaStmt = db.prepare("INSERT INTO ideas (id, text, createdAt) VALUES (?, ?, ?)");
    IDEAS.forEach(i => ideaStmt.run([i.id, i.text, i.createdAt.toISOString()]));
    ideaStmt.free();

    const settingsStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    settingsStmt.run(['theme', '"system"']);
    settingsStmt.run(['weekendDays', JSON.stringify([0, 6])]);
    settingsStmt.run(['streak', JSON.stringify({ currentStreak: 0, longestStreak: 0, lastCompletedDate: '' })]);
    settingsStmt.free();
};

const migrateFromLocalStorage = async (): Promise<boolean> => {
    const oldStateRaw = localStorage.getItem('appState');
    if (!oldStateRaw) return false;

    console.log("Старые данные из localStorage найдены. Начинается миграция в базу данных SQL...");
    try {
        const oldState = JSON.parse(oldStateRaw);

        const parseDate = (dateString: string | undefined | Date): string | null => {
            if (!dateString) return null;
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date.toISOString();
        };

        if (oldState.tasks && Array.isArray(oldState.tasks)) {
            const taskStmt = db.prepare("INSERT INTO tasks (id, title, isDone, priority, deadline, completedAt, projectId, categoryId, recurrence, timeOfDay, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            oldState.tasks.forEach((t: Task) => taskStmt.run([
                t.id, 
                t.title, 
                t.isDone ? 1 : 0, 
                t.priority, 
                parseDate(t.deadline), 
                parseDate(t.completedAt), 
                t.projectId ?? null,
                t.categoryId ?? null,
                t.recurrence ?? null,
                t.timeOfDay ?? null,
                t.assignedTo ?? null
            ]));
            taskStmt.free();
        }

        if (oldState.projects && Array.isArray(oldState.projects)) {
            const projectStmt = db.prepare("INSERT INTO projects (id, name, icon, color) VALUES (?, ?, ?, ?)");
            oldState.projects.forEach((p: Project) => projectStmt.run([p.id, p.name, p.icon ?? null, p.color ?? null]));
            projectStmt.free();
        }

        if (oldState.categories && Array.isArray(oldState.categories)) {
            const categoryStmt = db.prepare("INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)");
            oldState.categories.forEach((c: Category) => categoryStmt.run([c.id, c.name, c.icon ?? null, c.color ?? null]));
            categoryStmt.free();
        }

        if (oldState.ideas && Array.isArray(oldState.ideas)) {
            const ideaStmt = db.prepare("INSERT INTO ideas (id, text, createdAt) VALUES (?, ?, ?)");
            oldState.ideas.forEach((i: Idea) => ideaStmt.run([i.id, i.text, parseDate(i.createdAt)]));
            ideaStmt.free();
        }

        if (oldState.reviews && Array.isArray(oldState.reviews)) {
            const reviewStmt = db.prepare("INSERT INTO reviews (id, date, aiSummary, userNotes, mood) VALUES (?, ?, ?, ?, ?)");
            oldState.reviews.forEach((r: Review) => reviewStmt.run([r.id, parseDate(r.date), r.aiSummary, r.userNotes, r.mood ?? null]));
            reviewStmt.free();
        }
        
        // Seed employees as they were not in local storage
        const employeeStmt = db.prepare("INSERT INTO employees (id, name, avatar, color) VALUES (?, ?, ?, ?)");
        EMPLOYEES.forEach(e => employeeStmt.run([e.id, e.name, e.avatar ?? null, e.color ?? null]));
        employeeStmt.free();

        const settingsStmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
        if (oldState.theme) settingsStmt.run(['theme', JSON.stringify(oldState.theme)]);
        if (oldState.weekendDays) settingsStmt.run(['weekendDays', JSON.stringify(oldState.weekendDays)]);
        if (oldState.streakData) settingsStmt.run(['streak', JSON.stringify(oldState.streakData)]);
        settingsStmt.free();

        console.log("Миграция успешно завершена.");
        localStorage.removeItem('appState');
        return true;

    } catch (e) {
        console.error("Ошибка при миграции старых данных. Будет произведена загрузка стандартных данных.", e);
        return false;
    }
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
    } else {
        db = new SQL.Database();
        createSchema();
        const migrated = await migrateFromLocalStorage();
        if (!migrated) {
            seedDatabase();
        }
        await saveDbToIndexedDB();
    }
  } catch (err) {
      console.error("Не удалось инициализировать базу данных:", err);
  }
};

export const resetAllData = async () => {
    if (!db) return;
    const tables = ['tasks', 'projects', 'categories', 'ideas', 'reviews', 'employees', 'settings'];
    for (const table of tables) {
      db.run(`DELETE FROM ${table}`);
    }
    // Seeding the database again with default data
    seedDatabase();
    // Saving the fresh database state
    await saveDbToIndexedDB();
};

const executeQuery = (query: string, params: (string | number | null)[] = []) => {
    if (!db) return [];
    const stmt = db.prepare(query);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.get());
    }
    stmt.free();
    return results;
}

// Generic Getters
const getItems = <T,>(tableName: string, keys: (keyof T)[], mapper: (row: any[]) => T): T[] => {
    if (!db) return [];
    const res = db.exec(`SELECT ${keys.join(', ')} FROM ${tableName}`);
    if (!res[0]) return [];
    return res[0].values.map(mapper);
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


// Mappers
const taskKeys: (keyof Task)[] = ['id', 'title', 'isDone', 'priority', 'deadline', 'completedAt', 'projectId', 'categoryId', 'recurrence', 'timeOfDay', 'assignedTo', 'originalText', 'durationMinutes'];
const mapRowToTask = (row: any[]): Task => ({
    ...mapRowTo<any>(taskKeys, row),
    isDone: !!row[2],
    deadline: row[4] ? new Date(row[4]) : undefined,
    completedAt: row[5] ? new Date(row[5]) : undefined,
});

const projectKeys: (keyof Project)[] = ['id', 'name', 'icon', 'color'];
const mapRowToProject = (row: any[]): Project => mapRowTo<Project>(projectKeys, row);

const employeeKeys: (keyof Employee)[] = ['id', 'name', 'avatar', 'color'];
const mapRowToEmployee = (row: any[]): Employee => mapRowTo<Employee>(employeeKeys, row);

const categoryKeys: (keyof Category)[] = ['id', 'name', 'icon', 'color'];
const mapRowToCategory = (row: any[]): Category => mapRowTo<Category>(categoryKeys, row);

const ideaKeys: (keyof Idea)[] = ['id', 'text', 'createdAt'];
const mapRowToIdea = (row: any[]): Idea => ({
    ...mapRowTo<any>(ideaKeys, row),
    createdAt: new Date(row[2]),
});

const reviewKeys: (keyof Review)[] = ['id', 'date', 'aiSummary', 'userNotes', 'mood'];
const mapRowToReview = (row: any[]): Review => ({
    ...mapRowTo<any>(reviewKeys, row),
    date: new Date(row[1]),
});


// Public API for each type
export const getTasks = async (): Promise<Task[]> => getItems('tasks', taskKeys, mapRowToTask);
export const saveTask = async (task: Task) => saveItem('tasks', task);
export const deleteTask = async (taskId: string) => deleteItem('tasks', taskId);

export const getProjects = async (): Promise<Project[]> => getItems('projects', projectKeys, mapRowToProject);
export const saveProject = async (project: Project) => saveItem('projects', project);
export const deleteProject = async (projectId: string) => deleteItem('projects', projectId);

export const getEmployees = async (): Promise<Employee[]> => getItems('employees', employeeKeys, mapRowToEmployee);
export const saveEmployee = async (employee: Employee) => saveItem('employees', employee);
export const deleteEmployee = async (employeeId: string) => deleteItem('employees', employeeId);

export const getCategories = async (): Promise<Category[]> => getItems('categories', categoryKeys, mapRowToCategory);
export const saveCategory = async (category: Category) => saveItem('categories', category);
export const deleteCategory = async (categoryId: string) => deleteItem('categories', categoryId);

export const getIdeas = async (): Promise<Idea[]> => getItems('ideas', ideaKeys, mapRowToIdea);
export const saveIdea = async (idea: Idea) => saveItem('ideas', idea);
export const deleteIdea = async (ideaId: string) => deleteItem('ideas', ideaId);

export const getReviews = async (): Promise<Review[]> => getItems('reviews', reviewKeys, mapRowToReview);
export const saveReview = async (review: Review) => saveItem('reviews', review);
export const deleteReview = async (reviewId: string) => deleteItem('reviews', reviewId);

export const saveSetting = async <T,>(key: string, value: T) => {
    if (!db) return;
    const valueStr = JSON.stringify(value);
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, valueStr]);
    await saveDbToIndexedDB();
};

export const getSetting = async <T,>(key: string, defaultValue: T): Promise<T> => {
    if (!db) return defaultValue;
    const res = executeQuery("SELECT value FROM settings WHERE key = ?", [key]);
    if (res.length > 0 && res[0][0]) {
        try {
            return JSON.parse(res[0][0]);
        } catch (e) {
            // This handles the edge case where the theme might have been stored as a raw string
            if (key === 'theme' && typeof res[0][0] === 'string') return res[0][0] as any;
            return defaultValue;
        }
    }
    return defaultValue;
};