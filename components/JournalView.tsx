
import React, { useState } from 'react';
import { Review } from '../types';
import { EmptyState } from './EmptyState';

interface JournalViewProps {
  reviews: Review[];
  onUpdateNotes: (reviewId: string, notes: string) => void;
  onAddReview: (notes: string, mood: Review['mood']) => void;
  onUpdateMood: (reviewId: string, mood: Review['mood']) => void;
}

const moodConfig = {
    great: { icon: 'fa-face-grin-stars', color: 'text-green-500', label: 'Отлично' },
    good: { icon: 'fa-face-smile', color: 'text-lime-500', label: 'Хорошо' },
    okay: { icon: 'fa-face-meh', color: 'text-yellow-500', label: 'Нормально' },
    bad: { icon: 'fa-face-frown', color: 'text-orange-500', label: 'Плохо' },
    terrible: { icon: 'fa-face-dizzy', color: 'text-red-500', label: 'Ужасно' },
};

const MoodPicker: React.FC<{ selected: Review['mood'], onSelect: (mood: Review['mood']) => void }> = ({ selected, onSelect }) => (
    <div className="flex items-center justify-center gap-3 p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-full">
        {Object.entries(moodConfig).map(([key, { icon, color, label }]) => (
            <button
                key={key}
                onClick={() => onSelect(key as Review['mood'])}
                className={`text-2xl transition-transform transform hover:scale-125 ${selected === key ? color : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-500'}`}
                title={label}
            >
                <i className={`fa-solid ${icon}`}></i>
            </button>
        ))}
    </div>
);

const AddEntryCard: React.FC<{ onAdd: JournalViewProps['onAddReview'] }> = ({ onAdd }) => {
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState<Review['mood']>('okay');

    const handleSave = () => {
        if (!notes.trim()) return;
        onAdd(notes, mood);
        setNotes('');
        setMood('okay');
    };
    
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Добавить запись в журнал</h3>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Что у вас на уме? Какие инсайты вы получили сегодня?"
                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 h-24 transition"
            />
            <MoodPicker selected={mood} onSelect={setMood} />
            <button
                onClick={handleSave}
                disabled={!notes.trim()}
                className="w-full py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm disabled:bg-violet-400/50 disabled:cursor-not-allowed"
            >
                Сохранить запись
            </button>
        </div>
    )
}


const ReviewCard: React.FC<{ review: Review; onUpdateNotes: (notes: string) => void, onUpdateMood: (mood: Review['mood']) => void }> = ({ review, onUpdateNotes, onUpdateMood }) => {
  const [notes, setNotes] = useState(review.userNotes);

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
  };
  
  const mood = review.mood || 'okay';

  return (
    <div className="pl-8 relative">
       <div className={`absolute top-1 left-0 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-2xl ${moodConfig[mood].color}`}>
           <i className={`fa-solid ${moodConfig[mood].icon}`}></i>
       </div>
       <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">
            {new Date(review.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </h3>
          {review.aiSummary && (
            <div>
              <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Итоги от AI</h4>
              <p className="text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-700/50 p-4 rounded-lg">{review.aiSummary}</p>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Мои заметки</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder={review.aiSummary ? "Добавьте свои мысли к итогам дня..." : "Запишите что-нибудь..."}
              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 h-24 transition"
            />
          </div>
          <MoodPicker selected={mood} onSelect={onUpdateMood} />
       </div>
    </div>
  );
};

export const JournalView: React.FC<JournalViewProps> = ({ reviews, onUpdateNotes, onAddReview, onUpdateMood }) => {
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in-up">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Журнал рефлексии</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Оглянитесь на свои прошлые дни, чтобы лучше спланировать будущие.</p>
        </div>
        <AddEntryCard onAdd={onAddReview} />
        {reviews.length === 0 ? (
            <EmptyState
            illustration="journal"
            message="Начните вести журнал, добавив первую запись, или сохраните итоги дня после 18:00."
            />
        ) : (
            <div className="space-y-8 relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-zinc-200 dark:before:bg-zinc-700 before:transform before:-translate-x-1/2 ml-4">
                {sortedReviews.map(review => (
                    <ReviewCard 
                        key={review.id} 
                        review={review} 
                        onUpdateNotes={(notes) => onUpdateNotes(review.id, notes)} 
                        onUpdateMood={(mood) => onUpdateMood(review.id, mood)}
                    />
                ))}
            </div>
        )}
    </div>
  );
};
