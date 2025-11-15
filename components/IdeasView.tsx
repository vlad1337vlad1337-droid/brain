
import React, { useState } from 'react';
import { Idea } from '../types';
import { EmptyState } from './EmptyState';

interface IdeasViewProps {
  ideas: Idea[];
  onAddIdea: (text: string) => void;
  onConvertToTask: (idea: Idea) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({ ideas, onAddIdea, onConvertToTask }) => {
  const [newIdea, setNewIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      onAddIdea(newIdea.trim());
      setNewIdea('');
    }
  };

  return (
    <div className="p-4 sm:p-6 animate-fade-in-up">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm mb-6">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Буфер идей</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">Место для гениальных мыслей, которые еще не стали задачами.</p>
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Запишите новую идею..."
            className="flex-grow p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
          />
          <button type="submit" className="px-5 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm hover:shadow-md">
            Добавить
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {ideas.length > 0 ? ideas.map(idea => (
          <div key={idea.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm animate-fade-in-up flex justify-between items-center group">
            <div>
                <p className="text-zinc-800 dark:text-zinc-100">{idea.text}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                Записано: {idea.createdAt.toLocaleDateString('ru-RU')}
                </p>
            </div>
            <button 
                onClick={() => onConvertToTask(idea)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Превратить в задачу"
            >
                <i className="fas fa-arrow-right mr-2"></i>
                В задачу
            </button>
          </div>
        )) : (
            <EmptyState illustration="ideas" message="Запишите свою первую идею здесь!" />
        )}
      </div>
    </div>
  );
};
