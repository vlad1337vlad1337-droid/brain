import React, { ReactNode } from 'react';
import { Rnd } from 'react-rnd';
import { AppDefinition, WindowInstance } from '../types';

interface OsWindowProps {
  instance: WindowInstance;
  app: AppDefinition;
  children: ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStop: (id: string, pos: { x: number; y: number }) => void;
  onResizeStop: (id: string, size: { width: number | string; height: number | string }, pos: { x: number; y: number }) => void;
}

export const OsWindow: React.FC<OsWindowProps> = ({ instance, app, children, onClose, onFocus, onMinimize, onMaximize, onDragStop, onResizeStop }) => {
  const isMaximized = instance.isMaximized;

  const handleDragStop = (_e: any, d: { x: number; y: number; }) => {
    onDragStop(instance.id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (_e: any, _dir: any, ref: HTMLElement, _delta: any, position: { x: number; y: number; }) => {
    onResizeStop(instance.id, { width: ref.offsetWidth, height: ref.offsetHeight }, position);
  };
  
  const maximizedStyle = {
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '48px', // height of taskbar
  };

  return (
    <Rnd
      size={{ width: isMaximized ? '100vw' : instance.size.width, height: isMaximized ? 'calc(100vh - 48px)' : instance.size.height }}
      position={isMaximized ? { x: 0, y: 0 } : instance.position}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseDown={() => onFocus(instance.id)}
      minWidth={300}
      minHeight={200}
      dragHandleClassName="window-title-bar"
      cancel=".window-content, .window-controls button, .window-content input, .window-content textarea, .window-content select, .window-content button"
      className="bg-white dark:bg-zinc-800/90 rounded-lg shadow-2xl border border-zinc-300/50 dark:border-zinc-700/50 flex flex-col overflow-hidden transition-all duration-200"
      style={{ zIndex: instance.zIndex, ...(isMaximized ? maximizedStyle : {}) }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
    >
      <div className="window-title-bar h-10 bg-zinc-100 dark:bg-zinc-900/80 flex items-center justify-between px-3 cursor-move flex-shrink-0 border-b border-zinc-200 dark:border-zinc-700/50">
        <div className="flex items-center gap-2">
          <i className={`fa-solid ${app.icon} text-sm text-zinc-600 dark:text-zinc-300`}></i>
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 select-none">{app.name}</span>
        </div>
        <div className="window-controls flex items-center gap-1">
          <button onClick={() => onMinimize(instance.id)} className="w-6 h-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300" title="Свернуть"><i className="fa-solid fa-minus text-xs"></i></button>
          <button onClick={() => onMaximize(instance.id)} className="w-6 h-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300" title="Развернуть"><i className={`fa-regular ${isMaximized ? 'fa-window-restore' : 'fa-square'} text-xs`}></i></button>
          <button onClick={() => onClose(instance.id)} className="w-6 h-6 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center text-zinc-600 dark:text-zinc-300" title="Закрыть"><i className="fa-solid fa-xmark text-sm"></i></button>
        </div>
      </div>
      <div className="window-content flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-800">
        {children}
      </div>
    </Rnd>
  );
};