import React from 'react';
import { AppDefinition, WindowInstance, View, Task, StreakData, Project, Category, Employee, WidgetInstance, Account, WidgetDefinition, Transaction } from '../types';
import { APPLICATIONS } from '../constants';
import { OsWindow } from './OsWindow';
import { WidgetWrapper } from './WidgetWrapper';
import { WidgetGallery } from './WidgetGallery';

// Fix: Exported OsDesktopProps to be used in WidgetWrapper.tsx
export interface OsDesktopProps {
  windows: WindowInstance[];
  renderApp: (instance: WindowInstance) => React.ReactNode;
  openApp: (appId: View) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStop: (id: string, pos: { x: number; y: number }) => void;
  onResizeStop: (id: string, size: { width: number | string; height: number | string }, pos: { x: number; y: number }) => void;
  
  // Widget System Props
  widgets: WidgetInstance[];
  isDesktopEditing: boolean;
  onAddWidget: (widgetDef: WidgetDefinition) => void;
  onRemoveWidget: (widgetId: string) => void;
  onUpdateWidget: (widget: WidgetInstance) => void;

  // Data contexts for widgets
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  employees: Employee[];
  accounts: Account[];
  streakData: StreakData;
  onAddTask: (task: Task) => Promise<void>;
  onOpenNewTask: () => void;
  onUpdateTask: (task: Task) => void;
  transactions: Transaction[];
}

const DesktopIcon: React.FC<{ app: AppDefinition; onOpen: (id: View) => void }> = ({ app, onOpen }) => (
  <button
    onDoubleClick={() => onOpen(app.id)}
    className="flex flex-col items-center gap-2 w-24 h-24 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
  >
    <i className={`fa-solid ${app.icon} text-4xl text-white drop-shadow-lg`}></i>
    <span className="text-white text-sm font-semibold truncate w-full text-center drop-shadow-md">{app.name}</span>
  </button>
);


// --- MAIN DESKTOP COMPONENT ---
export const OsDesktop: React.FC<OsDesktopProps> = (props) => {
  const { 
    windows, renderApp, openApp, 
    widgets, isDesktopEditing, onAddWidget, onRemoveWidget, onUpdateWidget,
    ...windowHandlers 
  } = props;
  
  const widgetDataContext = {
    tasks: props.tasks,
    projects: props.projects,
    categories: props.categories,
    employees: props.employees,
    accounts: props.accounts,
    streakData: props.streakData,
    onAddTask: props.onAddTask,
    onOpenNewTask: props.onOpenNewTask,
    onUpdateTask: props.onUpdateTask,
    transactions: props.transactions,
    openApp: props.openApp,
  };

  return (
    <div className="absolute inset-0 h-full w-full">
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            <i className="fa-solid fa-plus text-5xl text-white/20 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"></i>
        </div>
    
        {/* Icons Layer */}
        <div className="absolute top-0 left-0 p-4 flex flex-col flex-wrap gap-2 pointer-events-auto z-10">
            {APPLICATIONS.map(app => (
                <DesktopIcon key={app.id} app={app} onOpen={openApp} />
            ))}
        </div>

        {/* Widgets Layer */}
        <div className="absolute inset-0 bottom-12 z-5">
          {widgets.map(widget => (
            <WidgetWrapper 
              key={widget.id}
              widget={widget}
              isEditing={isDesktopEditing}
              onRemove={onRemoveWidget}
              onUpdate={onUpdateWidget}
              dataContext={widgetDataContext}
            />
          ))}
        </div>

        {/* Windows Layer (on top) */}
        {windows.map(instance => {
            if (instance.isMinimized) return null;
            const app = APPLICATIONS.find(a => a.id === instance.appId);
            if (!app) return null;

            return (
            <OsWindow key={instance.id} instance={instance} app={app} {...windowHandlers}>
                {renderApp(instance)}
            </OsWindow>
            );
        })}
        
        {/* Widget Gallery Layer (highest) */}
        {isDesktopEditing && (
            <WidgetGallery
                onAddWidget={onAddWidget}
            />
        )}
    </div>
  );
};