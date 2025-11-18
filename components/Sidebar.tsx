import React from 'react';
import { StreakData, View } from '../types';
import { StreakCounter } from './StreakCounter';

interface SidebarProps {
  currentView: string;
  setView: (view: View) => void;
  streakData: StreakData;
  isBurntOutMode: boolean;
  onSetBurntOutMode: (mode: boolean) => void;
  onOpenApp: (appId: View) => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2.5 text-left rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-accent-50/10 text-accent-600 dark:text-accent-400'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      <i className={`fa-solid ${icon} w-6 text-center mr-3 text-lg transition-colors ${isActive ? 'text-accent-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}></i>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const Switch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; icon: string }> = ({ checked, onChange, label, icon }) => (
    <div className="flex items-center justify-between w-full px-4 py-2.5 text-left rounded-lg transition-all duration-200 group text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <div className="flex items-center">
            <i className={`fa-solid ${icon} w-6 text-center mr-3 text-lg text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300`}></i>
            <span className="font-medium">{label}</span>
        </div>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                checked ? 'bg-accent-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, streakData, isBurntOutMode, onSetBurntOutMode, onOpenApp }) => {
  return (
    <aside className="relative flex-shrink-0 w-72 bg-white dark:bg-zinc-900 p-5 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="flex items-center justify-between mb-6 pl-2">
        <div className="flex items-center">
            <i className="fa-solid fa-wave-square text-2xl mr-3 text-zinc-800 dark:text-zinc-100"></i>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Внешний мозг</h1>
        </div>
      </div>
      
      <nav className="flex flex-col space-y-1.5 flex-grow">
        {/* Core Productivity */}
        <NavItem icon="fa-wand-magic-sparkles" label="Создать с ИИ" isActive={currentView === 'ai-task-creation'} onClick={() => setView('ai-task-creation')} />
        <NavItem icon="fa-sun" label="Сегодня" isActive={currentView === 'today'} onClick={() => setView('today')} />
        <NavItem icon="fa-calendar-days" label="Календарь" isActive={currentView === 'calendar'} onClick={() => setView('calendar')} />
        <NavItem icon="fa-book-open" label="Журнал" isActive={currentView === 'journal'} onClick={() => setView('journal')} />
        
        <hr className="my-3 border-zinc-200 dark:border-zinc-800" />
        
        {/* Business Tools */}
        <NavItem icon="fa-chart-line" label="Финансы" isActive={false} onClick={() => onOpenApp('finance')} />
        <NavItem icon="fa-address-book" label="Контакты (CRM)" isActive={false} onClick={() => onOpenApp('crm')} />
        <NavItem icon="fa-chart-simple" label="Аналитика" isActive={currentView === 'analytics'} onClick={() => setView('analytics')} />
        
        <hr className="my-3 border-zinc-200 dark:border-zinc-800" />
        
        {/* Knowledge & Planning */}
        <NavItem icon="fa-diagram-project" label="Проекты" isActive={currentView === 'projects'} onClick={() => setView('projects')} />
        <NavItem icon="fa-user-group" label="Команда" isActive={currentView === 'employees'} onClick={() => setView('employees')} />
        <NavItem icon="fa-lightbulb" label="Идеи" isActive={currentView === 'ideas'} onClick={() => setView('ideas')} />
        <NavItem icon="fa-pen-to-square" label="Заметки" isActive={currentView === 'notes'} onClick={() => setView('notes')} />

        <hr className="my-3 border-zinc-200 dark:border-zinc-800" />
        
        {/* System */}
        <NavItem icon="fa-palette" label="Персонализация" isActive={false} onClick={() => onOpenApp('personalization')} />
        <NavItem icon="fa-sliders" label="Настройки" isActive={currentView === 'settings'} onClick={() => setView('settings')} />
        <Switch 
            checked={isBurntOutMode}
            onChange={onSetBurntOutMode}
            label="Режим выгорания"
            icon="fa-shield-heart"
        />
        <div className="flex-grow" />
      </nav>
      
      <StreakCounter streakData={streakData} />
    </aside>
  );
};