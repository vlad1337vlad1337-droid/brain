import React, { useState, useMemo, useRef } from 'react';
import { Transaction, FinanceCategory, TransactionType, Account, FinancialGoal } from '../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { EmptyState } from './EmptyState';
import { COLOR_PALETTE } from '../constants';
import { categorizeTransactions, parseTransactionsFromStatement, getFinancialAdvice, parseTransactionsFromFile } from '../services/geminiService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TransactionModalProps {
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
    categories: FinanceCategory[];
    accounts: Account[];
    type: TransactionType;
};

const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onSave, categories, accounts, type }) => {
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    
    const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    React.useEffect(() => {
        if (filteredCategories.length > 0) {
            setCategoryId(filteredCategories[0].id);
        }
    }, [filteredCategories]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0 || !categoryId || !accountId) return;
        onSave({
            amount: numAmount,
            type,
            categoryId,
            accountId,
            date: new Date(date),
            description
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">{type === 'income' ? 'Новый доход' : 'Новый расход'}</h2>
                <div className="space-y-4">
                    <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                    <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500">
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500">
                        {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                    <input type="text" placeholder="Описание (необязательно)" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">Отмена</button>
                    <button type="submit" className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm">Сохранить</button>
                </div>
            </form>
        </div>
    );
};

const TransferModal: React.FC<{ accounts: Account[], onClose: () => void, onSave: (fromId: string, toId: string, amount: number) => void }> = ({ accounts, onClose, onSave }) => {
    const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
    const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
    const [amount, setAmount] = useState('');
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); const numAmount = parseFloat(amount); if (numAmount > 0 && fromAccountId && toAccountId && fromAccountId !== toAccountId) { onSave(fromAccountId, toAccountId, numAmount); onClose(); } }
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Перевод между счетами</h2>
                <div className="space-y-4">
                    <div> <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Со счета</label> <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="w-full mt-1 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500"> {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)} </select> </div>
                    <div> <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">На счет</label> <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="w-full mt-1 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500"> {accounts.filter(a => a.id !== fromAccountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)} </select> </div>
                    <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">Отмена</button>
                    <button type="submit" className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm">Выполнить перевод</button>
                </div>
            </form>
        </div>
    );
};

const GoalModal: React.FC<{ onClose: () => void, onSave: (goal: Omit<FinancialGoal, 'id' | 'currentAmount' | 'createdAt'>) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const handleSave = (e: React.FormEvent) => { e.preventDefault(); const numAmount = parseFloat(targetAmount); if (name.trim() && numAmount > 0) { onSave({ name, targetAmount: numAmount }); onClose(); } };
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Новая финансовая цель</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Название цели (напр., новое оборудование)" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                    <input type="number" placeholder="Целевая сумма" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="1" step="any" className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-accent-500" />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">Отмена</button>
                    <button type="submit" className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm">Создать цель</button>
                </div>
            </form>
        </div>
    );
};


const StatCard: React.FC<{ title: string; amount: number; color: string; icon: string }> = ({ title, amount, color, icon }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-2xl`}> <i className={`fa-solid ${icon}`}></i> </div>
        <div> <p className="text-zinc-500 dark:text-zinc-400 font-semibold">{title}</p> <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p> </div>
    </div>
);

const TransactionReviewModal: React.FC<{ transactions: Omit<Transaction, 'id' | 'accountId'>[]; categories: FinanceCategory[]; accounts: Account[]; onConfirm: (reviewedTransactions: Omit<Transaction, 'id' | 'accountId'>[], accountId: string) => void; onClose: () => void; }> = ({ transactions, categories, accounts, onConfirm, onClose }) => {
    const [reviewed, setReviewed] = useState(transactions);
    const [selectedAccountId, setSelectedAccountId] = useState(accounts.find(a => a.type === 'business')?.id || accounts[0]?.id || '');
    const handleCategoryChange = (index: number, newCategoryId: string) => { const newTransactions = [...reviewed]; newTransactions[index].categoryId = newCategoryId; newTransactions[index].type = categories.find(c => c.id === newCategoryId)?.type as 'income' | 'expense' || 'expense'; setReviewed(newTransactions); };
    return (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Проверьте транзакции</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">ИИ проанализировал вашу выписку. Проверьте и подтвердите категории перед сохранением.</p>
                <div className="flex items-center gap-3 mb-4">
                    <label htmlFor="account-select" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex-shrink-0">Импортировать на счет:</label>
                    <select id="account-select" value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full max-w-xs p-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 text-sm focus:ring-1 focus:ring-accent-500"> {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)} </select>
                </div>
                <div className="flex-1 overflow-y-auto border-y border-zinc-200 dark:border-zinc-700 -mx-6 px-6 py-2">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-zinc-800"><tr><th className="p-2">Дата</th><th className="p-2">Описание</th><th className="p-2">Сумма</th><th className="p-2 w-52">Категория (AI)</th></tr></thead>
                        <tbody>
                            {reviewed.map((t, index) => (
                                <tr key={index} className="border-b border-zinc-100 dark:border-zinc-700/50">
                                    <td className="p-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString('ru-RU')}</td>
                                    <td className="p-2 text-zinc-600 dark:text-zinc-300 max-w-sm truncate">{t.description}</td>
                                    <td className={`p-2 font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{t.amount.toLocaleString('ru-RU')} ₽</td>
                                    <td className="p-2"><select value={t.categoryId} onChange={e => handleCategoryChange(index, e.target.value)} className="w-full p-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 text-xs focus:ring-1 focus:ring-accent-500"> {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)} </select></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">Отмена</button>
                    <button type="button" onClick={() => onConfirm(reviewed, selectedAccountId)} className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm">Сохранить</button>
                </div>
            </div>
        </div>
    )
}

const AIAnalystView: React.FC<{ onRunAnalysis: () => void; analysis: { summary: string; tips: string[] } | null; isLoading: boolean; }> = ({ onRunAnalysis, analysis, isLoading }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm max-w-4xl mx-auto animate-fade-in-up">
        <div className="flex items-center gap-4 mb-4"> <i className="fa-solid fa-brain text-4xl text-accent-500"></i> <div> <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">AI Финансовый ассистент</h3> <p className="text-sm text-zinc-500 dark:text-zinc-400">Получите инсайты и советы по улучшению вашего финансового положения.</p> </div> </div>
        {isLoading ? ( <div className="text-center py-10"> <i className="fa-solid fa-spinner fa-spin text-4xl text-accent-500"></i> <p className="mt-4 text-zinc-600 dark:text-zinc-300">Анализирую ваши данные...</p> </div> ) : analysis ? (
            <div className="space-y-6 animate-fade-in">
                <div> <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Краткий обзор</h4> <p className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-lg text-zinc-700 dark:text-zinc-200">{analysis.summary}</p> </div>
                <div> <h4 className="font-semibold text-zinc-600 dark:text-zinc-400 mb-3">Пять советов для вас:</h4>
                    <ul className="space-y-3"> {analysis.tips.map((tip, index) => ( <li key={index} className="flex items-start gap-3 p-3 bg-accent-50 dark:bg-accent-900/30 rounded-lg"> <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">{index + 1}</div> <p className="text-zinc-800 dark:text-zinc-100">{tip}</p> </li> ))} </ul>
                </div>
                <button onClick={onRunAnalysis} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"> <i className="fa-solid fa-rotate-right mr-2"></i> Проанализировать снова </button>
            </div>
        ) : ( <div className="text-center py-10"> <p className="text-zinc-600 dark:text-zinc-300 mb-4">Нажмите кнопку, чтобы получить финансовый анализ и персональные советы от ИИ.</p> <button onClick={onRunAnalysis} className="px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 font-semibold transition-colors shadow-sm text-base"> Анализировать финансы </button> </div> )}
    </div>
);

export const FinanceApp: React.FC<{ transactions: Transaction[]; categories: FinanceCategory[]; accounts: Account[]; goals: FinancialGoal[]; onSaveTransaction: (transaction: Transaction) => void; onSaveMultipleTransactions: (transactions: Transaction[]) => void; onDeleteTransaction: (transactionId: string) => void; onSaveGoal: (goal: Omit<FinancialGoal, 'id' | 'currentAmount' | 'createdAt'>) => void; onDeleteGoal: (goalId: string) => void; }> = ({ transactions, categories, accounts, goals, onSaveTransaction, onSaveMultipleTransactions, onDeleteTransaction, onSaveGoal, onDeleteGoal }) => {
    const [modalInfo, setModalInfo] = useState<{ type: TransactionType | 'transfer' | 'goal' } | null>(null);
    const [reviewingTransactions, setReviewingTransactions] = useState<Omit<Transaction, 'id' | 'accountId'>[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'assistant' | 'goals'>('overview');
    const [aiAnalysis, setAiAnalysis] = useState<{ summary: string; tips: string[] } | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const transactionsThisMonth = useMemo(() => transactions.filter(t => new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear), [transactions, currentMonth, currentYear]);
    const { income, expense, expenseByCategory } = useMemo(() => { let income = 0, expense = 0; const expenseByCategory: Record<string, number> = {}; transactionsThisMonth.forEach(t => { if (t.type === 'income') income += t.amount; else if (t.type === 'expense') { expense += t.amount; expenseByCategory[t.categoryId] = (expenseByCategory[t.categoryId] || 0) + t.amount; } }); return { income, expense, expenseByCategory }; }, [transactionsThisMonth]);
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
    const doughnutData = { labels: Object.keys(expenseByCategory).map(id => categoryMap.get(id)?.name || 'Неизвестно'), datasets: [{ data: Object.values(expenseByCategory), backgroundColor: COLOR_PALETTE, borderColor: isDarkMode ? '#18181b' : '#ffffff', borderWidth: 4, }], };
    const doughnutOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { color: isDarkMode ? '#e5e7eb' : '#374151' } } }, cutout: '70%', };
    const handleSave = (transaction: Omit<Transaction, 'id'>) => { onSaveTransaction({ ...transaction, id: `tr-${Date.now()}`}); };
    const handleSaveGoal = (goal: Omit<FinancialGoal, 'id'|'currentAmount'|'createdAt'>) => { onSaveGoal({ ...goal }); };
    const handleSaveTransfer = (fromId: string, toId: string, amount: number) => { const now = new Date(); const expenseCategory = categories.find(c => c.id === 'fc-exp-transfer'); const incomeCategory = categories.find(c => c.id === 'fc-inc-transfer'); if (!expenseCategory || !incomeCategory) { alert("Ошибка: не найдены системные категории для выполнения перевода."); return; } const expense: Transaction = { id: `tr-exp-${Date.now()}`, amount, type: 'expense', categoryId: expenseCategory.id, accountId: fromId, date: now, description: `Перевод на счет "${accounts.find(a => a.id === toId)?.name}"` }; const income: Transaction = { id: `tr-inc-${Date.now()}`, amount, type: 'income', categoryId: incomeCategory.id, accountId: toId, date: now, description: `Перевод со счета "${accounts.find(a => a.id === fromId)?.name}"` }; onSaveMultipleTransactions([expense, income]); };
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const files = event.target.files; if (!files || files.length === 0) return; setIsLoading(true); try { const filePromises = Array.from(files).map((file: File) => new Promise<{ file: File; content: string }>((resolve, reject) => { const reader = new FileReader(); reader.onload = (e: ProgressEvent<FileReader>) => { if (e.target?.result) resolve({ file, content: e.target.result as string }); else reject(new Error(`Не удалось прочитать файл: ${file.name}`)); }; reader.onerror = () => reject(new Error(`Ошибка при чтении файла: ${file.name}`)); if (file.type.startsWith('image/') || file.type === 'application/pdf') reader.readAsDataURL(file); else reader.readAsText(file); })); const loadedFiles = await Promise.all(filePromises); const transactionPromises = loadedFiles.map(async ({ file, content }) => { if (file.type.startsWith('image/') || file.type === 'application/pdf') { const base64Data = content.split(',')[1]; return await parseTransactionsFromFile({ mimeType: file.type, data: base64Data }); } else { return await parseTransactionsFromStatement(content); } }); const allTransactionsArrays = await Promise.all(transactionPromises); const allRawTransactions = allTransactionsArrays.flat(); if (allRawTransactions.length > 0) { const categorized = await categorizeTransactions(allRawTransactions, categories); setReviewingTransactions(categorized); } else { throw new Error("Не удалось найти транзакции ни в одном из загруженных документов."); } } catch (error) { const message = error instanceof Error ? error.message : "Ошибка при обработке одного или нескольких документов."; alert(message); } finally { setIsLoading(false); if (fileInputRef.current) fileInputRef.current.value = ""; } };
    const handleConfirmReview = (reviewed: Omit<Transaction, 'id' | 'accountId'>[], accountId: string) => { if (!accountId) { alert("Необходимо выбрать счет для импорта."); return; } const newTransactions = reviewed.map(t => ({...t, id: `tr-${Date.now()}-${Math.random()}`, accountId: accountId})); onSaveMultipleTransactions(newTransactions); setReviewingTransactions(null); }
    const handleRunAnalysis = async () => { setIsAnalysisLoading(true); const analysis = await getFinancialAdvice(transactionsThisMonth, accounts, categories); setAiAnalysis(analysis); setIsAnalysisLoading(false); }
    const navigateMonth = (offset: number) => { const newDate = new Date(currentYear, currentMonth + offset, 1); setCurrentMonth(newDate.getMonth()); setCurrentYear(newDate.getFullYear()); }
    const TABS = [ { id: 'overview', label: 'Обзор', icon: 'fa-chart-pie' }, { id: 'transactions', label: 'Операции', icon: 'fa-list-ul' }, { id: 'goals', label: 'Цели', icon: 'fa-flag-checkered' }, { id: 'assistant', label: 'AI Ассистент', icon: 'fa-brain' } ];

    return (
        <div className="p-4 sm:p-6 bg-slate-100 dark:bg-zinc-900 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-slate-200 dark:bg-zinc-800 p-1 rounded-lg"> {TABS.map(tab => ( <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 flex items-center gap-2 ${activeTab === tab.id ? 'bg-white dark:bg-zinc-700 text-accent-600 dark:text-accent-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}`}> <i className={`fa-solid ${tab.icon}`}></i>{tab.label} </button> ))} </div>
                <div className="flex gap-2 flex-wrap">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf,image/*,text/plain" className="hidden" multiple />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors shadow-sm text-sm flex items-center justify-center"> {isLoading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-upload mr-2"></i>} Загрузить выписку </button>
                    <button onClick={() => setModalInfo({type: 'transfer'})} className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-semibold transition-colors shadow-sm text-sm"><i className="fa-solid fa-exchange-alt mr-2"></i>Перевод</button>
                    <button onClick={() => setModalInfo({type: 'income'})} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors shadow-sm text-sm"><i className="fa-solid fa-plus mr-2"></i>Доход</button>
                    <button onClick={() => setModalInfo({type: 'expense'})} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors shadow-sm text-sm"><i className="fa-solid fa-minus mr-2"></i>Расход</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto -mx-6 px-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Доходы за месяц" amount={income} color="bg-green-500" icon="fa-arrow-up" />
                            <StatCard title="Расходы за месяц" amount={expense} color="bg-red-500" icon="fa-arrow-down" />
                            <StatCard title="Чистый поток" amount={income - expense} color={income - expense >= 0 ? 'bg-blue-500' : 'bg-orange-500'} icon="fa-dollar-sign" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Расходы по категориям</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                </div>
                            </div>
                            <div className="lg:col-span-3 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Счета</h3>
                                <ul className="space-y-3">
                                    {accounts.map(acc => (
                                        <li key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-100">{acc.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{acc.type === 'business' ? 'Бизнес' : 'Личный'}</p>
                                            </div>
                                            <p className="font-bold text-lg text-zinc-800 dark:text-zinc-100">{acc.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'transactions' && (
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Операции за месяц</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateMonth(-1)} className="p-2 w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700"><i className="fas fa-chevron-left"></i></button>
                                <span className="font-semibold text-sm w-32 text-center capitalize">{new Date(currentYear, currentMonth).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => navigateMonth(1)} className="p-2 w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700"><i className="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {transactionsThisMonth.length > 0 ? transactionsThisMonth.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                                const category = categoryMap.get(t.categoryId);
                                return (
                                    <li key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-lg group">
                                        <div className="flex items-center gap-4">
                                            {category && <i className={`fa-solid ${category.icon} w-6 text-center text-xl`} style={{color: category.color}}></i>}
                                            <div>
                                                <p className="font-semibold text-zinc-800 dark:text-zinc-100">{t.description || category?.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(t.date).toLocaleDateString('ru-RU')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                                            </p>
                                            <button onClick={() => window.confirm('Удалить эту операцию?') && onDeleteTransaction(t.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </li>
                                );
                            }) : <EmptyState illustration="no-tasks" message="Нет операций за этот месяц." />}
                        </ul>
                    </div>
                )}
                 {activeTab === 'goals' && (
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Финансовые цели</h3>
                             <button onClick={() => setModalInfo({ type: 'goal' })} className="px-4 py-2 bg-accent-500 text-white text-sm rounded-lg hover:bg-accent-600 font-semibold">Новая цель</button>
                        </div>
                        <div className="space-y-4">
                            {goals.length > 0 ? goals.map(goal => {
                                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                                return (
                                    <div key={goal.id} className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-zinc-800 dark:text-zinc-100">{goal.name}</span>
                                            <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-zinc-600 rounded-full h-2.5">
                                            <div className="bg-accent-500 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            <span>{goal.currentAmount.toLocaleString('ru-RU')} ₽</span>
                                            <span>{goal.targetAmount.toLocaleString('ru-RU')} ₽</span>
                                        </div>
                                    </div>
                                )
                            }) : <EmptyState illustration="no-tasks" message="У вас еще нет финансовых целей."/>}
                        </div>
                    </div>
                 )}
                {activeTab === 'assistant' && (
                    <AIAnalystView onRunAnalysis={handleRunAnalysis} analysis={aiAnalysis} isLoading={isAnalysisLoading} />
                )}
            </div>

            {modalInfo?.type === 'income' && <TransactionModal onClose={() => setModalInfo(null)} onSave={handleSave} categories={categories} accounts={accounts} type="income" />}
            {modalInfo?.type === 'expense' && <TransactionModal onClose={() => setModalInfo(null)} onSave={handleSave} categories={categories} accounts={accounts} type="expense" />}
            {modalInfo?.type === 'transfer' && <TransferModal onClose={() => setModalInfo(null)} onSave={handleSaveTransfer} accounts={accounts} />}
            {modalInfo?.type === 'goal' && <GoalModal onClose={() => setModalInfo(null)} onSave={handleSaveGoal} />}
            {reviewingTransactions && <TransactionReviewModal transactions={reviewingTransactions} categories={categories} accounts={accounts} onConfirm={handleConfirmReview} onClose={() => setReviewingTransactions(null)} />}
        </div>
    );
};