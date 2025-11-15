
import React, { useState, useMemo, useEffect } from 'react';
import { Task, Project, Category } from '../types';
import { calculateStats } from '../services/analyticsService';
import { getAnalyticsSummary } from '../services/geminiService';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsViewProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
}

type Period = 'this_week' | 'last_week' | 'this_month' | 'last_month';

const getDateRange = (period: Period): { start: Date, end: Date } => {
    const now = new Date();
    let start: Date, end: Date;
    
    switch(period) {
        case 'this_week':
            const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
            start = new Date(now.setDate(firstDayOfWeek));
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            break;
        case 'last_week':
            const firstDayOfLastWeek = now.getDate() - now.getDay() - 6;
            start = new Date(now.setDate(firstDayOfLastWeek));
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            break;
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};


export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, projects }) => {
    const [period, setPeriod] = useState<Period>('this_month');
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    
    const isDarkMode = document.documentElement.classList.contains('dark');

    const stats = useMemo(() => {
        const range = getDateRange(period);
        return calculateStats(tasks, projects, range);
    }, [tasks, projects, period]);
    
    useEffect(() => {
        const fetchSummary = async () => {
            if (stats.totalCompleted > 0) {
                setLoadingSummary(true);
                const summary = await getAnalyticsSummary(stats);
                setAiSummary(summary);
                setLoadingSummary(false);
            } else {
                setAiSummary('Недостаточно данных для анализа за выбранный период. Завершите несколько задач, чтобы увидеть отчет.');
            }
        };
        fetchSummary();
    }, [stats]);


    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: isDarkMode ? '#e5e7eb' : '#374151',
                    font: { size: 12, family: 'Inter' }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { 
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    stepSize: 1,
                    precision: 0,
                    font: { family: 'Inter' }
                },
                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
            },
            x: {
                ticks: { 
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    font: { family: 'Inter' }
                },
                grid: { display: false }
            },
        },
    };
    
    const lineChartData = {
        labels: Object.keys(stats.activity).map(d => new Date(d).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})),
        datasets: [{
            label: 'Завершено задач',
            data: Object.values(stats.activity),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.3,
        }]
    };

    const barChartData = {
        labels: Object.keys(stats.dayOfWeekCounts),
        datasets: [{
            label: 'Завершено задач',
            data: Object.values(stats.dayOfWeekCounts),
            backgroundColor: '#10b981',
            borderRadius: 4,
        }]
    };
    
    const doughnutChartData = {
        labels: Object.keys(stats.projectCounts),
        datasets: [{
            data: Object.values(stats.projectCounts),
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#8b5cf6', '#6366f1', '#a855f7'],
            borderWidth: 0,
        }]
    };

    const periodLabels: Record<Period, string> = {
        this_week: "Эта неделя",
        last_week: "Прошлая неделя",
        this_month: "Этот месяц",
        last_month: "Прошлый месяц",
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fade-in-up">
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm flex items-center justify-end">
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                    {Object.entries(periodLabels).map(([key, label]) => (
                        <button key={key} onClick={() => setPeriod(key as Period)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${period === key ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-semibold">Задач завершено</h3>
                    <p className="text-5xl font-bold mt-2 text-zinc-800 dark:text-zinc-100">{stats.totalCompleted}</p>
                </div>
                 <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm text-center flex flex-col justify-center">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-semibold">Продуктивный день</h3>
                    <p className="text-5xl font-bold mt-2 text-zinc-800 dark:text-zinc-100">{stats.mostProductiveDay || '–'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                    <h3 className="text-zinc-500 dark:text-zinc-400 font-semibold mb-2 text-center">Отчет от AI</h3>
                    {loadingSummary ? (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 animate-pulse text-center mt-4">Анализирую данные...</p>
                    ) : (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 text-center">{aiSummary}</p>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
                 <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Активность за период</h3>
                 <div className="h-80"><Line options={chartOptions} data={lineChartData} /></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Задачи по проектам</h3>
                    <div className="h-80 flex items-center justify-center"><Doughnut options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {position: 'right' as const}}}} data={doughnutChartData} /></div>
                </div>
                 <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm lg:col-span-3">
                    <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Продуктивность по дням недели</h3>
                    <div className="h-80"><Bar options={chartOptions} data={barChartData} /></div>
                </div>
            </div>
        </div>
    );
};
