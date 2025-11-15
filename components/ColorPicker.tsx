import React from 'react';
import { COLOR_PALETTE } from '../constants';

interface ColorPickerProps {
  selectedColor?: string;
  onSelectColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Выберите цвет</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onSelectColor(color)}
            className={`w-8 h-8 rounded-full transition-transform duration-150 transform hover:scale-110 focus:outline-none ${
              selectedColor === color ? 'ring-2 ring-offset-2 ring-zinc-800 dark:ring-offset-zinc-900 dark:ring-white' : 'ring-2 ring-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Выбрать цвет ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
