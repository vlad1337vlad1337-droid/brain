
import React from 'react';
import { AppDefinition, WindowInstance, View } from '../types';
import { APPLICATIONS } from '../constants';
import { OsWindow } from './OsWindow';

interface OsDesktopProps {
  windows: WindowInstance[];
  renderApp: (appId: View) => React.ReactNode;
  openApp: (appId: View) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStop: (id: string, pos: { x: number, y: number }) => void;
  onResizeStop: (id: string, size: { width: number | string, height: number | string }, pos: { x: number, y: number }) => void;
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

export const OsDesktop: React.FC<OsDesktopProps> = ({ windows, renderApp, openApp, ...windowHandlers }) => {
  return (
    <div className="absolute inset-0 h-full w-full">
      <div className="p-4 flex flex-col flex-wrap gap-2">
        {APPLICATIONS.map(app => (
          <DesktopIcon key={app.id} app={app} onOpen={openApp} />
        ))}
      </div>

      {windows.map(instance => {
        if (instance.isMinimized) return null;
        const app = APPLICATIONS.find(a => a.id === instance.appId);
        if (!app) return null;

        return (
          <OsWindow key={instance.id} instance={instance} app={app} {...windowHandlers}>
            {renderApp(instance.appId)}
          </OsWindow>
        );
      })}
    </div>
  );
};
