import React, { useMemo } from 'react';

const weatherOptions = [
    { condition: 'Солнечно', icon: 'fa-sun', color: 'text-yellow-400', temp: [18, 28] },
    { condition: 'Облачно', icon: 'fa-cloud', color: 'text-slate-400', temp: [12, 22] },
    { condition: 'Переменная облачность', icon: 'fa-cloud-sun', color: 'text-yellow-300', temp: [15, 25] },
    { condition: 'Дождь', icon: 'fa-cloud-showers-heavy', color: 'text-blue-400', temp: [10, 18] },
    { condition: 'Гроза', icon: 'fa-cloud-bolt', color: 'text-purple-400', temp: [16, 26] },
];

export const WeatherWidget: React.FC = () => {
    const weather = useMemo(() => {
        const option = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        const temp = Math.floor(Math.random() * (option.temp[1] - option.temp[0] + 1)) + option.temp[0];
        const humidity = Math.floor(Math.random() * 41) + 50; // 50-90%
        const wind = Math.floor(Math.random() * 15) + 5; // 5-20 km/h
        return { ...option, temp, humidity, wind };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center text-sm">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Москва</p>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" title="Настройки">
                    <i className="fa-solid fa-cog"></i>
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center text-center gap-4">
                <i className={`fa-solid ${weather.icon} text-5xl ${weather.color}`}></i>
                <div>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{weather.temp}°C</p>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 capitalize">{weather.condition}</p>
                </div>
            </div>
            <div className="flex justify-around text-xs text-zinc-500 dark:text-zinc-400">
                <div className="text-center">
                    <i className="fa-solid fa-wind mb-1"></i>
                    <p>{weather.wind} км/ч</p>
                </div>
                <div className="text-center">
                    <i className="fa-solid fa-droplet mb-1"></i>
                    <p>{weather.humidity}%</p>
                </div>
            </div>
        </div>
    );
};