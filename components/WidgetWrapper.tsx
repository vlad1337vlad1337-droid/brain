import React from 'react';
import { Rnd } from 'react-rnd';
import { WidgetInstance, View } from '../types';
import { WIDGET_DEFINITIONS } from '../constants';
import { ClockWidget } from './widgets/ClockWidget';
import { AgendaWidget } from './widgets/AgendaWidget';
import { ProjectProgressWidget } from './widgets/ProjectProgressWidget';
import { NotepadWidget } from './widgets/NotepadWidget';
import { FinanceWidget } from './widgets/FinanceWidget';
import { QuoteWidget } from './widgets/QuoteWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { StreakWidget } from './widgets/StreakWidget';
import { OsDesktopProps } from './OsDesktop';
import { parseTaskFromText } from '../services/geminiService';
import { Task, TaskPriority, Transaction } from '../types';

interface WidgetWrapperProps {
  widget: WidgetInstance;
  isEditing: boolean;
  onRemove: (id: string) => void;
  onUpdate: (widget: WidgetInstance) => void;
  dataContext: Omit<OsDesktopProps, 'windows' | 'renderApp' | 'widgets' | 'isDesktopEditing' | 'onAddWidget' | 'onRemoveWidget' | 'onFocus' | 'onClose' | 'onMinimize' | 'onMaximize' | 'onDragStop' | 'onResizeStop' >;
}

const AiTaskWidget: React.FC<Pick<WidgetWrapperProps['dataContext'], 'projects' | 'categories' | 'employees' | 'onAddTask'>> = 
({ projects, categories, employees, onAddTask }) => {
    const [text, setText] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
  
    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      setIsLoading(true);
      try {
        const parsedTask = await parseTaskFromText(text, projects, categories, employees);
        const newTask: Task = {
          id: `t${Date.now()}`,
          isDone: false,
          priority: TaskPriority.MEDIUM,
          ...parsedTask,
          title: parsedTask.title!,
        };
        await onAddTask(newTask);
        setText('');
      } catch (e) {
        console.error("Widget task creation failed", e);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="p-1 h-full flex flex-col">
        <form onSubmit={handleCreate} className="flex flex-col gap-2 flex-grow">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Что нужно сделать?"
            className="w-full flex-grow p-2 text-sm border-0 rounded-lg bg-black/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-1 focus:ring-violet-500"
            disabled={isLoading}
          />
          <button type="submit" className="w-full py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm disabled:bg-violet-400/50 flex items-center justify-center" disabled={!text.trim() || isLoading}>
            {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Создать'}
          </button>
        </form>
      </div>
    );
  };

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget, isEditing, onRemove, onUpdate, dataContext }) => {
    const widgetDef = WIDGET_DEFINITIONS.find(def => def.type === widget.type);
    if (!widgetDef) return null;

    const handleDragStop = (_e: any, d: { x: number; y: number }) => {
        onUpdate({ ...widget, position: { x: d.x, y: d.y } });
    };

    const handleResizeStop = (_e: any, _dir: any, ref: HTMLElement, _delta: any, position: { x: number; y: number }) => {
        onUpdate({
            ...widget,
            size: { width: ref.offsetWidth, height: ref.offsetHeight },
            position,
        });
    };
    
    const handleConfigChange = (newConfig: any) => {
        onUpdate({ ...widget, config: { ...widget.config, ...newConfig }});
    }

    const renderWidgetContent = () => {
        switch (widget.type) {
            case 'CLOCK': return <ClockWidget />;
            case 'WEATHER': return <WeatherWidget />;
            case 'STREAK': return <StreakWidget streakData={dataContext.streakData} />;
            case 'AI_TASK': return <AiTaskWidget {...dataContext} />;
            case 'AGENDA': return <AgendaWidget tasks={dataContext.tasks} onUpdateTask={dataContext.onUpdateTask} onOpenNewTask={dataContext.onOpenNewTask} />;
            case 'PROJECT_PROGRESS': return <ProjectProgressWidget projects={dataContext.projects} tasks={dataContext.tasks} config={widget.config} onConfigChange={handleConfigChange} />;
            case 'FINANCE_OVERVIEW': return <FinanceWidget accounts={dataContext.accounts} transactions={dataContext.transactions} config={widget.config} onConfigChange={handleConfigChange} openApp={dataContext.openApp as (appId: 'finance') => void} />;
            case 'NOTEPAD': return <NotepadWidget config={widget.config} onConfigChange={handleConfigChange} />;
            case 'QUOTE': return <QuoteWidget />;
            default: return <p>Unknown Widget</p>;
        }
    };

    return (
        <Rnd
            size={widget.size}
            position={widget.position}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            minWidth={widgetDef.minSize.width}
            minHeight={widgetDef.minSize.height}
            bounds="parent"
            className={`bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-lg group transition-all duration-200 ${isEditing ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black/20' : ''}`}
            disableDragging={!isEditing}
            enableResizing={isEditing}
        >
            <div className="w-full h-full p-4 flex flex-col relative">
                {isEditing && (
                    <>
                        <div className="absolute -top-3 -left-3 cursor-move w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg" title="Переместить">
                           <i className="fa-solid fa-arrows-up-down-left-right text-xs"></i>
                        </div>
                        <button
                            onClick={() => onRemove(widget.id)}
                            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                            title="Удалить виджет"
                        >
                            <i className="fa-solid fa-times text-sm"></i>
                        </button>
                    </>
                )}
                {renderWidgetContent()}
            </div>
        </Rnd>
    );
};