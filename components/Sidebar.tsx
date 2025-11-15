import React from 'react';
import { StreakData } from '../types';
import { StreakCounter } from './StreakCounter';

type View = 'today' | 'ideas' | 'projects' | 'calendar' | 'analytics' | 'journal' | 'employees' | 'settings';

interface SidebarProps {
  currentView: string;
  setView: (view: View) => void;
  streakData: StreakData;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{ icon: string; label: string; viewName: View; currentView: string; setView: (view: View) => void; }> = ({ icon, label, viewName, currentView, setView }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => setView(viewName)}
      className={`flex items-center w-full px-4 py-2.5 text-left rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <i className={`fa-solid ${icon} w-6 text-center mr-3 text-lg transition-colors ${isActive ? 'text-violet-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}></i>
      <span className="font-medium">{label}</span>
    </button>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, streakData, isMobile, isOpen, onClose }) => {
  return (
    <aside className={`
        ${isMobile 
            ? `fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : 'relative flex-shrink-0'}
        w-72 bg-white dark:bg-zinc-900 p-5 border-r border-zinc-200 dark:border-zinc-800 flex flex-col
    `}>
      <div className="flex items-center justify-between mb-6 pl-2">
        <div className="flex items-center">
            <i className="fa-solid fa-brain text-2xl mr-3 text-zinc-800 dark:text-zinc-100"></i>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Внешний мозг</h1>
        </div>
        {isMobile && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                <i className="fas fa-times"></i>
            </button>
        )}
      </div>
      
      <nav className="flex flex-col space-y-1.5 flex-grow">
        <NavItem icon="fa-house" label="Сегодня" viewName="today" currentView={currentView} setView={setView} />
        <NavItem icon="fa-calendar" label="Календарь" viewName="calendar" currentView={currentView} setView={setView} />
        <NavItem icon="fa-chart-pie" label="Аналитика" viewName="analytics" currentView={currentView} setView={setView} />
        <NavItem icon="fa-book" label="Журнал" viewName="journal" currentView={currentView} setView={setView} />
        <hr className="my-3 border-zinc-200 dark:border-zinc-800" />
        <NavItem icon="fa-folder-open" label="Проекты" viewName="projects" currentView={currentView} setView={setView} />
        <NavItem icon="fa-users" label="Команда" viewName="employees" currentView={currentView} setView={setView} />
        <NavItem icon="fa-lightbulb" label="Идеи" viewName="ideas" currentView={currentView} setView={setView} />
        <div className="flex-grow" />
        <hr className="my-3 border-zinc-200 dark:border-zinc-800" />
        <NavItem icon="fa-gear" label="Настройки" viewName="settings" currentView={currentView} setView={setView} />
      </nav>
      
      <StreakCounter streakData={streakData} />
    </aside>
  );
};