import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, Project, CommandPaletteAction, View, AppDefinition } from '../types';
import { APPLICATIONS, TASK_PRIORITY_CONFIG } from '../constants';

interface CommandPaletteProps {
  onClose: () => void;
  openApp: (appId: View, initialSubView?: View) => void;
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}

const CommandPaletteItem: React.FC<{ action: CommandPaletteAction; isSelected: boolean; }> = ({ action, isSelected }) => {
  return (
    <li
      className={`p-3 flex items-center justify-between gap-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-violet-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
    >
      <div className="flex items-center gap-4 truncate">
        <i className={`fa-solid ${action.icon} w-5 text-center text-lg ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}></i>
        <span className="truncate">{action.title}</span>
        {action.type === 'task' && action.task && (
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TASK_PRIORITY_CONFIG[action.task.priority].color}`}></div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs flex-shrink-0">
        {action.type === 'task' && action.task?.isDone && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'}`}>Выполнено</span>
        )}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{action.section}</span>
      </div>
    </li>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, openApp, tasks, projects, onEditTask, onNewTask }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const baseActions: CommandPaletteAction[] = useMemo(() => {
    const appActions: CommandPaletteAction[] = [];
    
    // Main Apps
    APPLICATIONS.forEach(app => {
        appActions.push({
            id: `open-app-${app.id}`,
            type: 'app',
            title: `Открыть: ${app.name}`,
            icon: app.icon,
            section: 'Приложения',
            perform: () => openApp(app.id),
            keywords: `open launch ${app.name} ${app.id}`
        });
    });

    // Sub-views inside External Brain
    // Fix: Corrected the type definition for `subApps` to correctly represent an array of objects.
    const subApps: Omit<AppDefinition, 'defaultSize'>[] = [
        { id: 'today', name: 'Сегодня', icon: 'fa-sun' },
        { id: 'calendar', name: 'Календарь', icon: 'fa-calendar-days' },
        { id: 'analytics', name: 'Аналитика', icon: 'fa-chart-simple' },
        { id: 'journal', name: 'Журнал', icon: 'fa-book-open' },
        { id: 'projects', name: 'Проекты', icon: 'fa-diagram-project' },
        { id: 'employees', name: 'Команда', icon: 'fa-user-group' },
        { id: 'ideas', name: 'Идеи', icon: 'fa-lightbulb' },
        { id: 'notes', name: 'Заметки', icon: 'fa-pen-to-square' },
        { id: 'settings', name: 'Настройки', icon: 'fa-sliders' },
    ];
    
    subApps.forEach(subApp => {
        appActions.push({
            id: `open-subapp-${subApp.id}`,
            type: 'app',
            title: `Открыть: ${subApp.name}`,
            icon: subApp.icon,
            section: 'Приложения',
            perform: () => openApp('external-brain', subApp.id),
            keywords: `open launch ${subApp.name} ${subApp.id}`
        });
    });

    const taskActions: CommandPaletteAction[] = tasks.map(task => ({
        id: `edit-task-${task.id}`,
        type: 'task',
        title: task.title,
        icon: 'fa-pencil',
        section: 'Задачи',
        perform: () => onEditTask(task),
        keywords: projects.find(p => p.id === task.projectId)?.name,
        task: task,
    }));
    
    const generalActions: CommandPaletteAction[] = [
        {
            id: 'new-task',
            type: 'action',
            title: 'Новая задача',
            icon: 'fa-plus',
            section: 'Действия',
            perform: onNewTask,
            keywords: 'create add'
        }
    ];

    return [...appActions, ...taskActions, ...generalActions];
  }, [openApp, tasks, projects, onEditTask, onNewTask]);

  const filteredActions = useMemo(() => {
    if (!query) return baseActions;
    const lowerQuery = query.toLowerCase();
    return baseActions.filter(action =>
      action.title.toLowerCase().includes(lowerQuery) ||
      action.keywords?.toLowerCase().includes(lowerQuery)
    );
  }, [query, baseActions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredActions]);
  
  useEffect(() => {
    resultsRef.current?.children[selectedIndex]?.scrollIntoView({
        block: 'nearest',
    });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        action.perform();
        onClose();
      }
    }
  };
  
  const handleItemClick = (index: number) => {
      const action = filteredActions[index];
      if (action) {
          action.perform();
          onClose();
      }
  }

  const groupedActions = useMemo(() => {
    return filteredActions.reduce((acc, action) => {
      if (!acc[action.section]) {
        acc[action.section] = [];
      }
      acc[action.section].push(action);
      return acc;
    }, {} as Record<string, CommandPaletteAction[]>);
  }, [filteredActions]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[9999] pt-20 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Что вы хотите сделать?"
            className="w-full bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd>esc</kbd>
        </div>
        <ul ref={resultsRef} className="p-2 max-h-[60vh] overflow-y-auto">
          {/* Fix: Replaced Object.entries with Object.keys to fix a type inference issue. The value from Object.entries was being inferred as 'unknown', causing a crash when calling .map on it. */}
          {Object.keys(groupedActions).length > 0 ? Object.keys(groupedActions).map((section) => (
            <li key={section}>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 uppercase">{section}</h3>
              <ul>
                {groupedActions[section].map(action => (
                    <div key={action.id} onClick={() => handleItemClick(filteredActions.indexOf(action))}>
                        <CommandPaletteItem 
                            action={action}
                            isSelected={filteredActions.indexOf(action) === selectedIndex}
                        />
                    </div>
                ))}
              </ul>
            </li>
          )) : <p className="text-center text-slate-500 p-8">Ничего не найдено.</p>}
        </ul>
      </div>
    </div>
  );
};