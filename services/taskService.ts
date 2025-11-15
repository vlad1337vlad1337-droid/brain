import { Task, RecurrenceRule } from '../types';

export const isSameDay = (d1: Date, d2: Date): boolean => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() === date2.getTime();
}

export const getNextDueDate = (currentDueDate: Date, rule: RecurrenceRule): Date => {
    const nextDate = new Date(currentDueDate);
    switch (rule) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate;
};

export const getTasksForDate = (tasks: Task[], date: Date) => {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const completedToday: Task[] = [];

    tasks.forEach(task => {
        if (task.completedAt && isSameDay(new Date(task.completedAt), today)) {
            completedToday.push(task);
            return;
        }

        if (task.isDone) {
            return;
        }

        if (task.deadline) {
            const deadline = new Date(task.deadline);
            deadline.setHours(0, 0, 0, 0);

            if (deadline.getTime() < today.getTime()) {
                overdue.push(task);
            } else if (deadline.getTime() === today.getTime()) {
                dueToday.push(task);
            }
        }
    });

    return { 
        overdue: overdue.sort((a,b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()), 
        dueToday, 
        completedToday 
    };
};
