
import React, { useMemo } from 'react';
import { Task, Employee, Project, Category } from '../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';

interface EmployeeViewProps {
  tasks: Task[];
  employees: Employee[];
  projects: Project[];
  categories: Category[];
  onUpdateTask: (task: Task) => void;
  onSetFocusTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onPostponeTask: (taskId: string) => void;
}

const isSameDay = (d1: Date, d2: Date): boolean => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() === date2.getTime();
}

const EmployeeCard: React.FC<Omit<EmployeeViewProps, 'employees'> & { employee: Employee }> =
({ tasks, employee, projects, categories, onUpdateTask, onSetFocusTask, onEditTask, onViewTask, onPostponeTask }) => {

    const { employeeTasks, activeTasks, completedToday, completedCount } = useMemo(() => {
        const today = new Date();
        const employeeTasks = tasks.filter(task => task.assignedTo === employee.id);
        const activeTasks = employeeTasks.filter(t => !t.isDone);
        const completedToday = employeeTasks.filter(t => t.completedAt && isSameDay(new Date(t.completedAt), today));
        const completedCount = employeeTasks.filter(t => t.isDone).length;
        return { employeeTasks, activeTasks, completedToday, completedCount };
    }, [tasks, employee.id]);

    const handleTaskClick = (task: Task) => {
        if (task.isDone) {
            onViewTask(task);
        } else {
            onEditTask(task);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                        <i className={`${employee.avatar || 'fa-solid fa-user'}`} style={{color: employee.color}}></i>
                        <span>{employee.name}</span>
                    </h2>
                     <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {activeTasks.length} в работе, {completedToday.length} завершено сегодня
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <i className="fa-solid fa-check-circle text-green-500"></i>
                    <span>{completedCount}/{employeeTasks.length}</span>
                </div>
            </div>

            <div className="space-y-4 flex-grow">
                {activeTasks.length > 0 && (
                    <div>
                         <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Активные задачи</h3>
                         <div className="space-y-2.5">
                            {activeTasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    project={projects.find(p => p.id === task.projectId)}
                                    category={categories.find(c => c.id === task.categoryId)}
                                    onUpdate={onUpdateTask}
                                    onSetFocus={onSetFocusTask}
                                    onEdit={handleTaskClick}
                                    onPostponeTask={onPostponeTask}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {completedToday.length > 0 && (
                    <div>
                         <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Выполнено сегодня</h3>
                         <div className="space-y-2.5">
                            {completedToday.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    project={projects.find(p => p.id === task.projectId)}
                                    category={categories.find(c => c.id === task.categoryId)}
                                    onUpdate={onUpdateTask}
                                    onSetFocus={onSetFocusTask}
                                    onEdit={handleTaskClick}
                                    onPostponeTask={onPostponeTask}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTasks.length === 0 && (
                     <div className="flex-grow flex items-center justify-center h-full">
                        <EmptyState 
                            illustration={'all-done'} 
                            message={`${employee.name} завершил(а) все задачи!`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


export const EmployeeView: React.FC<EmployeeViewProps> = (props) => {
  const { tasks, employees, categories } = props;
  
  const unassignedTasks = tasks.filter(t => !t.assignedTo && !t.isDone);

  const handleTaskClick = (task: Task) => {
    if (task.isDone) {
        props.onViewTask(task);
    } else {
        props.onEditTask(task);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {employees.map(employee => (
                <EmployeeCard key={employee.id} employee={employee} {...props} />
            ))}
        </div>
        
        {unassignedTasks.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-inbox text-zinc-800 dark:text-zinc-100 text-xl"></i>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Без исполнителя</h2>
                </div>
                <div className="space-y-3">
                    {unassignedTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            project={props.projects.find(p => p.id === task.projectId)}
                            category={categories.find(c => c.id === task.categoryId)}
                            onUpdate={props.onUpdateTask}
                            onSetFocus={props.onSetFocusTask}
                            onEdit={handleTaskClick}
                            onPostponeTask={props.onPostponeTask}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
