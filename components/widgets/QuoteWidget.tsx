import React, { useState, useCallback } from 'react';
import { QUOTES } from '../../quotes';

const getRandomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

export const QuoteWidget: React.FC = () => {
    const [quote, setQuote] = useState(getRandomQuote);

    const refreshQuote = useCallback(() => {
        setQuote(getRandomQuote());
    }, []);

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2 relative group">
            <button
                onClick={refreshQuote}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Новая цитата"
            >
                <i className="fa-solid fa-rotate-right text-xs"></i>
            </button>
             <i className="fa-solid fa-quote-left text-2xl text-violet-500 mb-2"></i>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {quote}
            </p>
        </div>
    );
};