
import React, { useState, useEffect } from 'react';
// Fix: Removed TaskStatus as it's not defined in types.ts and not used.
import { Task } from '../types';
import { getEndOfDayReview } from '../services/geminiService';

interface EndOfDayReviewProps {
    tasks: Task[];
    onSaveReview: (summary: string) => void;
}

export const EndOfDayReview: React.FC<EndOfDayReviewProps> = ({ tasks, onSaveReview }) => {
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            const today = new Date().toDateString();
            const completedTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today);
            // Fix: Changed t.status !== TaskStatus.DONE to !t.isDone to match the Task type.
            const incompleteTasks = tasks.filter(t => !t.isDone && (t.deadline && new Date(t.deadline).toDateString() === today));
            
            if (completedTasks.length === 0 && incompleteTasks.length === 0) {
                setLoading(false);
                return;
            }

            const result = await getEndOfDayReview(completedTasks, incompleteTasks);
            setReview(result.summary);
            setLoading(false);
        };

        fetchReview();
    }, [tasks]);

    if (loading) {
        return (
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm flex items-center gap-4 animate-pulse">
                <div className="text-2xl text-zinc-400">
                    <i className="fa-regular fa-moon"></i>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">Подвожу итоги вашего дня...</p>
            </div>
        );
    }
    
    if (!review) return null;

    return (
        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm flex items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
                <div className="text-2xl text-zinc-400">
                    <i className="fa-regular fa-bed-empty"></i>
                </div>
                <div>
                     <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Итоги дня</h3>
                     <p className="text-zinc-600 dark:text-zinc-300">{review}</p>
                </div>
            </div>
            <button 
                onClick={() => onSaveReview(review)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex-shrink-0 shadow-sm"
                title="Сохранить в журнал"
            >
                <i className="fa-regular fa-bookmark mr-2"></i>
                Сохранить
            </button>
        </div>
    );
};