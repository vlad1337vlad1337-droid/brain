import React, { useState } from 'react';
import { View, Task, Project, Category, Employee, Idea, Review, Holiday, StreakData, KnowledgeNote, TaskPriority } from '../types';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { CalendarView } from './CalendarView';
import { AnalyticsView } from './AnalyticsView';
import { JournalView } from './JournalView';
import { ProjectsView } from './ProjectsView';
import { EmployeeView } from './EmployeeView';
import { IdeasView } from './IdeasView';
import { NotesView } from './NotesView';
import { SettingsView } from './SettingsView';
import { parseTaskFromText } from '../services/geminiService';

interface ExternalBrainAppProps {
  initialView: View;
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  employees: Employee[];
  ideas: Idea[];
  reviews: Review[];
  streakData: StreakData;
  weekendDays: number[];
  notes: KnowledgeNote[];
  isBurntOutMode: boolean;
  onSetBurntOutMode: (mode: boolean) => void;
  onUpdateTask: (task: Task) => void;
  onSetFocusTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onPostponeTask: (taskId: string) => void;
  onAddTask: (task: Task) => Promise<void>;
  onSaveReview: (summary: string) => void;
  onViewHoliday: (holiday: Holiday) => void;
  onAddIdea: (text: string) => void;
  onConvertToTask: (idea: Idea) => void;
  onUpdateNotes: (reviewId: string, notes: string) => void;
  onAddReview: (notes: string, mood: Review['mood']) => void;
  onUpdateMood: (reviewId: string, mood: Review['mood']) => void;
  onOpenModal: (mode: 'new' | 'edit', data?: Task, prefill?: Partial<Task>) => void;
  onSaveNote: (note: KnowledgeNote) => void;
  onDeleteNote: (noteId: string) => void;
  onSaveProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateWeekendDays: (days: number[]) => void;
  onResetData: () => void;
  onOpenApp: (appId: View) => void;
}

const AiTaskCreator: React.FC<{
  projects: Project[];
  categories: Category[];
  employees: Employee[];
  onTaskCreate: (task: Task) => Promise<void>;
}> = ({ projects, categories, employees, onTaskCreate }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedTask, setLastCreatedTask] = useState<Task | null>(null);

  const handleCreate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setLastCreatedTask(null);
    try {
      const parsedTask = await parseTaskFromText(text, projects, categories, employees);
      const newTask: Task = {
        id: `t${Date.now()}`,
        isDone: false,
        priority: TaskPriority.MEDIUM,
        ...parsedTask,
        title: parsedTask.title!,
      };
      await onTaskCreate(newTask);
      setText('');
      setLastCreatedTask(newTask);
    } catch (e: any) {
      setError(e.message || "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm relative w-full">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-wand-magic-sparkles text-2xl text-accent-500"></i>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') handleCreate() }}
          placeholder="Позвонить китайским поставщикам завтра утром..."
          className="flex-grow p-2 border-0 bg-transparent focus:ring-0 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          disabled={isLoading}
        />
        <button
          onClick={handleCreate}
          disabled={isLoading || !text.trim()}
          className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-all shadow-sm disabled:bg-accent-400/80 disabled:cursor-not-allowed flex items-center justify-center w-32"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Создать'
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2 pl-10">{error}</p>}
      {lastCreatedTask && !error && (
        <div className="text-xs text-green-600 mt-2 pl-10 animate-fade-in">
          ✓ Задача "{lastCreatedTask.title}" успешно создана!
        </div>
      )}
    </div>
  );
};


export const ExternalBrainApp: React.FC<ExternalBrainAppProps> = (props) => {
    const [currentView, setCurrentView] = useState<View>(props.initialView || 'ai-task-creation');

    const renderCurrentView = () => {
        const commonProps = {
            tasks: props.tasks,
            projects: props.projects,
            categories: props.categories,
            onUpdateTask: props.onUpdateTask,
            onSetFocusTask: props.onSetFocusTask,
            onEditTask: (task: Task) => props.onOpenModal('edit', task),
            onViewTask: props.onViewTask,
            onPostponeTask: props.onPostponeTask,
        };

        switch (currentView) {
            case 'ai-task-creation':
                return (
                    <div className="p-4 sm:p-6 h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-800/50">
                        <div className="w-full max-w-3xl text-center">
                            <div className="relative inline-block mb-4">
                                <i className="fa-solid fa-brain text-6xl text-accent-500"></i>
                                <i className="fa-solid fa-wand-magic-sparkles text-3xl text-yellow-400 absolute -bottom-2 -right-3 transform rotate-12"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Основной инструмент</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-xl mx-auto">Это ядро вашей системы. Просто напишите, что нужно сделать, а мы распознаем детали: дедлайн, проект, приоритет и исполнителя.</p>
                            <AiTaskCreator 
                                projects={props.projects} 
                                categories={props.categories} 
                                employees={props.employees}
                                onTaskCreate={props.onAddTask}
                            />
                        </div>
                    </div>
                );
            case 'today':
                return <Dashboard {...commonProps} employees={props.employees} onAddTask={props.onAddTask} isBurntOutMode={props.isBurntOutMode} onSaveReview={props.onSaveReview} onViewHoliday={props.onViewHoliday} />;
            case 'calendar':
                return <CalendarView {...commonProps} weekendDays={props.weekendDays} onAddTask={(date, timeOfDay) => props.onOpenModal('new', undefined, { deadline: date, timeOfDay })} onViewHoliday={props.onViewHoliday} />;
            case 'analytics':
                return <AnalyticsView tasks={props.tasks} projects={props.projects} categories={props.categories} />;
            case 'journal':
                return <JournalView reviews={props.reviews} onUpdateNotes={props.onUpdateNotes} onAddReview={props.onAddReview} onUpdateMood={props.onUpdateMood} />;
            case 'projects':
                return <ProjectsView {...commonProps} />;
            case 'employees':
                return <EmployeeView {...commonProps} employees={props.employees} />;
            case 'ideas':
                return <IdeasView ideas={props.ideas} onAddIdea={props.onAddIdea} onConvertToTask={props.onConvertToTask} />;
            case 'notes':
                return <NotesView notes={props.notes} onSaveNote={props.onSaveNote} onDeleteNote={props.onDeleteNote} />;
            case 'settings':
                return <SettingsView 
                    projects={props.projects}
                    categories={props.categories}
                    onSaveProject={props.onSaveProject}
                    onDeleteProject={props.onDeleteProject}
                    onSaveCategory={props.onSaveCategory}
                    onDeleteCategory={props.onDeleteCategory}
                    weekendDays={props.weekendDays}
                    onUpdateWeekendDays={props.onUpdateWeekendDays}
                    onResetData={props.onResetData}
                />;
            default:
                return <Dashboard {...commonProps} employees={props.employees} onAddTask={props.onAddTask} isBurntOutMode={props.isBurntOutMode} onSaveReview={props.onSaveReview} onViewHoliday={props.onViewHoliday} />;
        }
    }

    return (
        <div className="flex h-full w-full bg-slate-100 dark:bg-zinc-800">
            <Sidebar currentView={currentView} setView={setCurrentView} streakData={props.streakData} isBurntOutMode={props.isBurntOutMode} onSetBurntOutMode={props.onSetBurntOutMode} onOpenApp={props.onOpenApp} />
            <main className="flex-1 overflow-y-auto hide-scrollbar">
                {renderCurrentView()}
            </main>
        </div>
    );
};