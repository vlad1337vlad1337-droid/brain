import React from 'react';
import { Project, Category } from '../types';

type Option = (Project | Category) & { type: 'Project' | 'Category' };

interface IconicSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
}

export const IconicSelect: React.FC<IconicSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.id === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectRef]);


  const handleSelect = (optionId: string) => {
    onChange(optionId === 'none' ? undefined : optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-left flex items-center justify-between"
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            <i className={`${selectedOption.icon} w-5 text-center`} style={{ color: selectedOption.color }}></i>
            <span className="font-medium text-zinc-800 dark:text-zinc-100">{selectedOption.name}</span>
          </div>
        ) : (
          <span className="text-zinc-400">{placeholder}</span>
        )}
        <i className={`fas fa-chevron-down transition-transform text-zinc-400 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg border dark:border-zinc-700 max-h-60 overflow-auto animate-fade-in">
          <ul>
            <li
              key="none"
              onClick={() => handleSelect('none')}
              className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-500"
            >
              {placeholder}
            </li>
            {options.map(option => (
              <li
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-3 group relative"
              >
                <i className={`${option.icon} w-5 text-center`} style={{ color: option.color }}></i>
                <span className="font-medium text-zinc-800 dark:text-zinc-100">{option.name}</span>
                <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {option.type}
                   <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-zinc-900"></div>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
