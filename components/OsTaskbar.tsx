import React, { useState, useEffect, useRef } from 'react';
import { WindowInstance, StreakData, View, Settings } from '../types';
import { APPLICATIONS } from '../constants';
import { StreakCounter } from './StreakCounter';

interface OsTaskbarProps {
  windows: WindowInstance[];
  openApp: (appId: View) => void;
  focusWindow: (id: string) => void;
  streakData: StreakData;
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onOpenNewTask: () => void;
  isDesktopEditing: boolean;
  onSetDesktopEditing: (editing: boolean) => void;
  onToggleNotifications: () => void;
  unreadCount: number;
}

const ThemeIcon: React.FC<{ theme: Settings['theme'] }> = ({ theme }) => {
    if (theme === 'light') return <i className="fas fa-sun"></i>;
    if (theme === 'dark') return <i className="fas fa-moon"></i>;
    return <i className="fas fa-desktop"></i>;
};

export const OsTaskbar: React.FC<OsTaskbarProps> = (props) => {
  const { windows, openApp, focusWindow, streakData, settings, onUpdateSettings, onOpenNewTask, isDesktopEditing, onSetDesktopEditing, onToggleNotifications, unreadCount } = props;
  const [time, setTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) setIsStartMenuOpen(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) setIsThemeMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-12 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-2 z-[999]">
      <div className="flex items-center gap-1">
        <div className="relative" ref={startMenuRef}>
            <button onClick={() => setIsStartMenuOpen(p => !p)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${isStartMenuOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
                <i className="fa-solid fa-wave-square text-xl text-zinc-800 dark:text-zinc-100"></i>
            </button>
             {isStartMenuOpen && (
                <div className="absolute bottom-full mb-2 w-72 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-lg rounded-lg shadow-2xl p-2 border border-zinc-200 dark:border-zinc-700 animate-fade-in-up">
                    <div className="grid grid-cols-4 gap-2">
                         {APPLICATIONS.map(app => (
                            <button key={app.id} onClick={() => { openApp(app.id); setIsStartMenuOpen(false); }} className="flex flex-col items-center gap-1.5 p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10">
                                <i className={`fa-solid ${app.icon} text-2xl text-zinc-700 dark:text-zinc-200`}></i>
                                <span className="text-xs text-zinc-800 dark:text-zinc-100">{app.name}</span>
                            </button>
                        ))}
                    </div>
                    <hr className="my-2 border-zinc-200 dark:border-zinc-700" />
                    <StreakCounter streakData={streakData} />
                </div>
            )}
        </div>
        <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
        {windows.map(win => {
            const app = APPLICATIONS.find(a => a.id === win.appId);
            if (!app) return null;
            const isFocused = windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]).id === win.id;
            return (
                <button key={win.id} onClick={() => focusWindow(win.id)} className={`h-9 px-3 rounded-md flex items-center gap-2 transition-colors relative ${isFocused && !win.isMinimized ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title={app.name}>
                    <i className={`fa-solid ${app.icon} text-zinc-700 dark:text-zinc-200`}></i>
                    {!win.isMinimized && isFocused && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-500 rounded-full"></div>}
                    {win.isMinimized && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>}
                </button>
            )
        })}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onOpenNewTask} className="h-9 px-3 rounded-lg flex items-center gap-2 transition-colors bg-accent-500 text-white hover:bg-accent-600 font-semibold text-sm">
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Новая задача</span>
        </button>
         <button onClick={() => onSetDesktopEditing(!isDesktopEditing)} className={`h-9 px-3 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold ${isDesktopEditing ? 'text-accent-500 bg-accent-100 dark:bg-accent-900/50' : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'}`} title="Настроить виджеты">
            <i className="fa-solid fa-grip"></i>
            <span className="hidden sm:inline">Виджеты</span>
        </button>
        <button onClick={onToggleNotifications} className="w-10 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 relative" title="Уведомления">
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        <div className="relative" ref={themeMenuRef}>
            <button onClick={() => setIsThemeMenuOpen(p => !p)} className="w-10 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5" title="Сменить тему">
                <ThemeIcon theme={settings.theme} />
            </button>
             {isThemeMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-lg rounded-lg shadow-2xl p-1 border border-zinc-200 dark:border-zinc-700 animate-fade-in-up">
                  <button onClick={() => { onUpdateSettings({ theme: 'light' }); setIsThemeMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3"><i className="fas fa-sun w-5 text-center"></i> Светлая</button>
                  <button onClick={() => { onUpdateSettings({ theme: 'dark' }); setIsThemeMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3"><i className="fas fa-moon w-5 text-center"></i> Темная</button>
                  <button onClick={() => { onUpdateSettings({ theme: 'system' }); setIsThemeMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3"><i className="fas fa-desktop w-5 text-center"></i> Системная</button>
                </div>
              )}
        </div>
        <div className="text-right text-sm px-2">
            <div className="font-semibold text-zinc-800 dark:text-zinc-100">{time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{time.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
        </div>
      </div>
    </footer>
  );
};