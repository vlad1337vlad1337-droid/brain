import React from 'react';
import { WidgetDefinition } from '../types';
import { WIDGET_DEFINITIONS } from '../constants';

interface WidgetGalleryProps {
    onAddWidget: (widgetDef: WidgetDefinition) => void;
}

export const WidgetGallery: React.FC<WidgetGalleryProps> = ({ onAddWidget }) => {
    return (
        <div className="absolute inset-0 bottom-12 bg-black/30 backdrop-blur-md z-20 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-2xl">
                <h2 className="text-2xl font-bold text-center p-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
                    Добавить виджеты
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto">
                    {WIDGET_DEFINITIONS.map(widgetDef => (
                        <div key={widgetDef.type} className="bg-white/80 dark:bg-slate-900/60 p-4 rounded-lg flex flex-col items-start justify-between shadow-md">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <i className={`fa-solid ${widgetDef.icon} text-xl text-violet-500`}></i>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{widgetDef.name}</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{widgetDef.description}</p>
                            </div>
                            <button
                                onClick={() => onAddWidget(widgetDef)}
                                className="mt-4 w-full py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm"
                            >
                                Добавить
                            </button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-center p-2 text-slate-500 dark:text-slate-400">
                    Нажмите <kbd className="px-1.5 py-0.5 border rounded bg-slate-200 dark:bg-slate-700">Esc</kbd> чтобы выйти.
                </p>
            </div>
        </div>
    );
};
