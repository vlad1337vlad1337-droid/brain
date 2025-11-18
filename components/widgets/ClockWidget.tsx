import React, { useState, useEffect } from 'react';

export const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const hour = time.getHours();
    const timeIcon = hour >= 6 && hour < 18 ? 'fa-sun' : 'fa-moon';

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 mb-2">
                <i className={`fa-solid ${timeIcon}`}></i>
                <p className="text-sm capitalize">
                    {time.toLocaleDateString('ru-RU', { weekday: 'long' })}
                </p>
            </div>
            <p className="text-5xl font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
        </div>
    );
};