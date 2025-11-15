
import React, { useState, useEffect } from 'react';
import { Project, Category } from '../types';
import { ICON_LIST, COLOR_PALETTE } from '../constants';
import { ColorPicker } from './ColorPicker';

interface SettingsViewProps {
  projects: Project[];
  categories: Category[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  weekendDays: number[];
  onUpdateWeekendDays: (days: number[]) => void;
  onResetData: () => void;
}

const inputBaseClasses = "w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";
const buttonBaseClasses = "px-5 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 font-semibold transition-colors shadow-sm";

type SettingsTab = 'projects' | 'categories' | 'general';

interface ItemEditFormProps {
  item?: Omit<Project | Category, 'id'> & { id?: string };
  onSave: (item: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

const ItemEditForm: React.FC<ItemEditFormProps> = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const [icon, setIcon] = useState(item?.icon || ICON_LIST[0]);
  const [color, setColor] = useState(item?.color || COLOR_PALETTE[0]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), icon, color });
    }
  };

  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg space-y-4 animate-fade-in">
        <div className="flex items-center gap-4">
            <div className="flex-1 space-y-4">
                 <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Название"
                    className={inputBaseClasses}
                    autoFocus
                />
                <ColorPicker selectedColor={color} onSelectColor={setColor} />
            </div>
            <div className="text-center">
                 <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Предпросмотр</p>
                 <span className="flex items-center justify-center w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-lg text-3xl" style={{ color }}>
                    <i className={icon}></i>
                </span>
            </div>
        </div>
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Выберите иконку</label>
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-h-32 overflow-y-auto">
          {ICON_LIST.map(i => (
            <button key={i} type="button" onClick={() => setIcon(i)} className={`text-xl p-2 rounded-lg transition-colors ${icon === i ? 'bg-violet-500 text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
              <i className={i}></i>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} className={buttonBaseClasses}>Сохранить</button>
        <button onClick={onCancel} className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">Отмена</button>
      </div>
    </div>
  );
};


const ItemManager: React.FC<{
  items: (Project | Category)[];
  onSave: (item: any) => void;
  onDelete: (id: string) => void;
  itemType: 'Project' | 'Category';
}> = ({ items, onSave, onDelete, itemType }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSave = (itemData: Omit<Project, 'id'>) => {
    const itemToSave = {
      id: editingId || `${itemType === 'Project' ? 'p' : 'c'}${Date.now()}`,
      ...itemData,
    };
    onSave(itemToSave);
    setEditingId(null);
    setShowAddForm(false);
  };
  
  const itemTypeName = itemType === 'Project' ? 'проект' : 'категорию';

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">Управление {itemType === 'Project' ? 'проектами' : 'категориями'}</h3>
      <div className="space-y-2 mb-4 min-h-[60px]">
        {items.length > 0 ? items.map(item => (
          <div key={item.id}>
            {editingId === item.id ? (
              <ItemEditForm item={item} onSave={handleSave} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="group flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors">
                <span className="flex items-center gap-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <i className={`${item.icon || 'fa-solid fa-folder'} w-5 text-center`} style={{ color: item.color }}></i> {item.name}
                </span>
                <div className="flex items-center gap-1">
                 {confirmDeleteId === item.id ? (
                    <>
                        <button onClick={() => { onDelete(item.id); setConfirmDeleteId(null); }} className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded">Подтвердить</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 text-xs font-semibold text-zinc-600 bg-zinc-200 rounded">Отмена</button>
                    </>
                 ) : (
                    <>
                        <button onClick={() => { setEditingId(item.id); setShowAddForm(false); }} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:bg-zinc-300/50 dark:hover:bg-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100" title={`Редактировать`}>
                            <i className="fas fa-pencil"></i>
                        </button>
                        <button onClick={() => setConfirmDeleteId(item.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" title={`Удалить`}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </>
                 )}
                </div>
              </div>
            )}
          </div>
        )) : <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Здесь пока ничего нет.</p>}
      </div>

      {showAddForm && <ItemEditForm onSave={handleSave} onCancel={() => setShowAddForm(false)} />}
      
      {!showAddForm && !editingId &&(
        <button onClick={() => setShowAddForm(true)} className={`${buttonBaseClasses} w-full mt-4`}>
          <i className="fa-solid fa-plus mr-2"></i>
          Добавить {itemTypeName}
        </button>
      )}
    </div>
  )
};

const WeekendSelector: React.FC<{ selectedDays: number[]; onUpdate: (days: number[]) => void; }> = ({ selectedDays, onUpdate }) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    const toggleDay = (dayIndex: number) => {
        const newSelection = selectedDays.includes(dayIndex)
            ? selectedDays.filter(d => d !== dayIndex)
            : [...selectedDays, dayIndex];
        onUpdate(newSelection.sort());
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
            <h4 className="text-lg font-bold mb-2 text-zinc-800 dark:text-zinc-100">Ваши выходные дни</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Счетчик продуктивности не будет сбрасываться, если вы не выполняете задачи в эти дни.</p>
            <div className="flex items-center justify-between gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl">
                {days.map((day, index) => {
                    const isSelected = selectedDays.includes(index);
                    return (
                         <button
                            key={index}
                            onClick={() => toggleDay(index)}
                            className={`flex-1 py-2 px-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                isSelected 
                                ? 'bg-violet-500 text-white shadow' 
                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60'
                            }`}
                         >
                            {day}
                         </button>
                    )
                })}
            </div>
        </div>
    );
};

const DangerZone: React.FC<{ onReset: () => void; }> = ({ onReset }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const CONFIRMATION_WORD = 'сбросить';

    return (
        <div className="bg-red-500/5 dark:bg-red-900/10 p-6 rounded-2xl shadow-sm border border-red-500/30">
            <h4 className="text-lg font-bold text-red-600 dark:text-red-400">Опасная зона</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4">Эти действия необратимы. Пожалуйста, будьте осторожны.</p>
            {!showConfirm && (
                <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors">
                    Сбросить все данные
                </button>
            )}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showConfirm ? 'max-h-96 opacity-100 pt-4 mt-4 border-t border-red-500/30' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        Вы уверены? Это действие удалит все ваши задачи, проекты, категории и записи в журнале.
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        Чтобы подтвердить, введите <strong className="text-red-500">{CONFIRMATION_WORD}</strong> в поле ниже:
                    </p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className={`${inputBaseClasses} focus:ring-red-500 focus:border-red-500`}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={onReset}
                            disabled={confirmText !== CONFIRMATION_WORD}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400/50 disabled:cursor-not-allowed"
                        >
                            Я понимаю последствия, сбросить все
                        </button>
                        <button onClick={() => { setShowConfirm(false); setConfirmText(''); }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('projects');
  
  const TABS: { id: SettingsTab; label: string; icon: string }[] = [
      { id: 'projects', label: 'Проекты', icon: 'fa-folder-open' },
      { id: 'categories', label: 'Категории', icon: 'fa-tags' },
      { id: 'general', label: 'Общие', icon: 'fa-sliders' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start mx-auto shadow-inner">
            {TABS.map(tab => (
                 <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                        activeTab === tab.id 
                        ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                    }`}
                >
                    <i className={`fa-solid ${tab.icon}`}></i>
                    {tab.label}
                 </button>
            ))}
        </div>

        <div className="animate-fade-in">
          {activeTab === 'projects' && (
            <ItemManager 
              key="projects"
              items={props.projects}
              onSave={props.onSaveProject}
              onDelete={props.onDeleteProject}
              itemType="Project"
            />
          )}
          {activeTab === 'categories' && (
             <ItemManager 
              key="categories"
              items={props.categories}
              onSave={props.onSaveCategory}
              onDelete={props.onDeleteCategory}
              itemType="Category"
            />
          )}
          {activeTab === 'general' && (
             <div className="space-y-6">
                <WeekendSelector selectedDays={props.weekendDays} onUpdate={props.onUpdateWeekendDays} />
                <DangerZone onReset={props.onResetData} />
            </div>
          )}
      </div>
    </div>
  );
};
