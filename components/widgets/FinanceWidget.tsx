import React from 'react';
import { Account, Transaction, View } from '../../types';

interface FinanceWidgetProps {
  accounts: Account[];
  transactions: Transaction[];
  config?: { accountId?: string };
  onConfigChange: (config: { accountId?: string }) => void;
  openApp: (appId: 'finance') => void;
}

export const FinanceWidget: React.FC<FinanceWidgetProps> = ({ accounts, transactions, config, onConfigChange, openApp }) => {
    const selectedAccountId = config?.accountId;
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    const { income, expense, totalBalance } = React.useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const transactionsThisMonth = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const income = transactionsThisMonth
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactionsThisMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        return { income, expense, totalBalance };
    }, [transactions, accounts]);

    const handleQuickAdd = () => {
        openApp('finance');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <i className="fa-solid fa-wallet text-violet-500"></i>
                    Финансы
                </h3>
                <select
                    value={selectedAccountId || 'all'}
                    onChange={(e) => onConfigChange({ accountId: e.target.value === 'all' ? undefined : e.target.value })}
                    className="text-xs bg-transparent border-0 focus:ring-0 p-0 text-zinc-500 dark:text-zinc-400"
                >
                    <option value="all">Общий обзор</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                {selectedAccount ? (
                    <>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedAccount.name}</p>
                        <p className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                            {selectedAccount.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </>
                ) : (
                    <div className="w-full">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Общий баланс</p>
                        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                            {totalBalance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">В этом месяце</p>
                        <div className="flex justify-center items-center gap-4 text-sm mt-1">
                             <span className="text-green-500 font-semibold">↑{income.toLocaleString('ru-RU')}</span>
                             <span className="text-red-500 font-semibold">↓{expense.toLocaleString('ru-RU')}</span>
                        </div>
                    </div>
                )}
            </div>
             <button onClick={handleQuickAdd} className="mt-2 w-full text-xs py-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg font-semibold">
                <i className="fa-solid fa-plus mr-1"></i> Добавить операцию
            </button>
        </div>
    );
};