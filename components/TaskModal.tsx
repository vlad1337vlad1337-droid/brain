import React, { useState, useEffect } from 'react';
import { Task, Project, Category, TaskPriority, TimeOfDay } from '../types';
import { TASK_PRIORITY_CONFIG } from '../constants';
import { IconicSelect } from './IconicSelect';

type ModalState = {
  mode: 'new' | 'edit';
  data?: Task;
  prefill?: Partial<Task>;
};

interface TaskModalProps {
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  initialState: ModalState;
  projects: Project[];
  categories: Category[];
}

const emptyTask: Omit<Task, 'id'> = {
  title: '',
  isDone: false,
  priority: TaskPriority.MEDIUM,
};

const getISODate = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  
const getTodayISO = () => getISODate(new Date());

const TimeOfDaySelector: React.FC<{ value?: TimeOfDay, onChange: (value: TimeOfDay | undefined) => void }> = ({ value, onChange }) => {
    const options: { id: TimeOfDay; icon: string; label: string }[] = [
        { id: 'morning', icon: 'fa-sun', label: 'Утро' },
        { id: 'afternoon', icon: 'fa-cloud-sun', label: 'День' },
        { id: 'evening', icon: 'fa-moon', label: 'Вечер' }
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Время дня</label>
            <div className="flex items-center justify-between gap-2">
                {options.map(opt => (
                     <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange(value === opt.id ? undefined : opt.id)}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            value === opt.id 
                            ? 'bg-violet-500 text-white border-violet-500 font-semibold shadow-sm' 
                            : 'bg-zinc-100 dark:bg-zinc-700/50 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                     >
                        <i className={`fa-solid ${opt.icon}`}></i>
                        <span>{opt.label}</span>
                     </button>
                ))}
            </div>
        </div>
    );
};

const PrioritySelector: React.FC<{ value: TaskPriority, onChange: (value: TaskPriority) => void }> = ({ value, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Приоритет</label>
            <div className="grid grid-cols-3 gap-2">
                {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                     <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key as TaskPriority)}
                        className={`py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                            value === key
                            ? 'bg-violet-500 text-white border-violet-500 font-semibold shadow-sm' 
                            : 'bg-zinc-100 dark:bg-zinc-700/50 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                     >
                        <i className={config.icon}></i>
                        <span>{config.text}</span>
                     </button>
                ))}
            </div>
        </div>
    );
};


export const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSaveTask, onDeleteTask, initialState, projects, categories }) => {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  useEffect(() => {
    if (initialState.mode === 'edit' && initialState.data) {
      setCurrentTask(initialState.data);
    } else { // new mode
      setCurrentTask({ ...emptyTask, ...initialState.prefill });
    }
  }, [initialState]);

  const handleSave = () => {
    if (!currentTask.title?.trim()) {
        alert("Название задачи не может быть пустым.");
        return;
    }
    
    let deadline = currentTask.deadline ? new Date(currentTask.deadline) : undefined;
    if (deadline && !isNaN(deadline.getTime())) {
        if (currentTask.timeOfDay && !initialState.prefill?.timeOfDay) { 
            deadline.setHours(0, 0, 0, 0); 
            switch(currentTask.timeOfDay) {
                case 'morning': deadline.setHours(9); break;
                case 'afternoon': deadline.setHours(14); break;
                case 'evening': deadline.setHours(20); break;
            }
        }
    }

    const taskToSave: Task = {
        id: currentTask.id || `t${Date.now()}`,
        ...emptyTask,
        ...currentTask,
        title: currentTask.title.trim(),
        deadline: deadline,
    } as Task;

    onSaveTask(taskToSave);
  };

  const handleDelete = () => {
    if (initialState.mode === 'edit' && initialState.data?.id && window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      onDeleteTask(initialState.data.id);
    }
  };
  
  const updateField = (field: keyof Task, value: any) => {
      if ((field === 'projectId' || field === 'categoryId' || field === 'recurrence') && value === '') {
          value = undefined;
      }
      setCurrentTask(prev => ({ ...prev, [field]: value }));
  }
  
  const setDeadline = (when: 'today' | 'tomorrow') => {
      const newDate = new Date();
      if (when === 'tomorrow') {
          newDate.setDate(newDate.getDate() + 1);
      }
      updateField('deadline', newDate);
  }

  const renderTitle = () => {
    return initialState.mode === 'edit' ? 'Редактировать задачу' : 'Создать новую задачу';
  }
    
  const inputBaseClasses = "w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";
  
  const projectOptions = projects.map(p => ({...p, type: 'Project' as const}));
  const categoryOptions = categories.map(c => ({...c, type: 'Category' as const}));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{renderTitle()}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-5">
            <input type="text" placeholder="Название задачи" value={currentTask.title || ''} onChange={e => updateField('title', e.target.value)} className={inputBaseClasses} />
            
            <PrioritySelector value={currentTask.priority || TaskPriority.MEDIUM} onChange={v => updateField('priority', v)} />
            
            <TimeOfDaySelector value={currentTask.timeOfDay} onChange={(v) => updateField('timeOfDay', v)} />
            
            <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Крайний срок</label>
                <div className="flex gap-2">
                    <input
                        id="deadline"
                        type="date"
                        min={getTodayISO()}
                        value={getISODate(currentTask.deadline)}
                        onChange={e => {
                            if (e.target.value) {
                                const [year, month, day] = e.target.value.split('-').map(Number);
                                updateField('deadline', new Date(year, month - 1, day));
                            } else {
                                updateField('deadline', undefined);
                            }
                        }}
                        className={inputBaseClasses}
                    />
                    <button type="button" onClick={() => setDeadline('today')} className="px-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium">Сегодня</button>
                    <button type="button" onClick={() => setDeadline('tomorrow')} className="px-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium">Завтра</button>
                </div>
            </div>

            <select value={currentTask.recurrence || ''} onChange={e => updateField('recurrence', e.target.value)} className={inputBaseClasses}>
                <option value="">Не повторять</option>
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
                <option value="yearly">Ежегодно</option>
            </select>
            
            <div className="grid grid-cols-2 gap-4">
                 <IconicSelect options={projectOptions} value={currentTask.projectId} onChange={v => updateField('projectId', v)} placeholder="Без проекта" />
                 <IconicSelect options={categoryOptions} value={currentTask.categoryId} onChange={v => updateField('categoryId', v)} placeholder="Без категории" />
            </div>
        </div>
        <div className="flex justify-between items-center mt-8">
            <div>
            {initialState.mode === 'edit' && (
                <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg hover:bg-red-600/20 font-semibold transition-colors">Удалить</button>
            )}
            </div>
            <div className="flex space-x-3">
                <button onClick={onClose} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">
                   Отмена
                </button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm hover:shadow-md">Сохранить</button>
            </div>
        </div>
      </div>
    </div>
  );
};