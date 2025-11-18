import React, { useState, useEffect } from 'react';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

interface NotepadWidgetProps {
    config?: { text?: string };
    onConfigChange: (config: { text: string }) => void;
}

export const NotepadWidget: React.FC<NotepadWidgetProps> = ({ config, onConfigChange }) => {
    const [text, setText] = useState(config?.text || '');
    const debouncedText = useDebounce(text, 500);

    useEffect(() => {
        if (debouncedText !== (config?.text || '')) {
            onConfigChange({ text: debouncedText });
        }
    }, [debouncedText, config?.text, onConfigChange]);
    
    return (
        <div className="h-full flex flex-col p-2 bg-[#FFFDE7] dark:bg-[#4E4B34] rounded-lg shadow-inner">
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Запишите что-нибудь..."
                className="w-full flex-grow text-sm p-2 border-0 rounded-lg bg-transparent text-zinc-800 dark:text-yellow-100 placeholder-zinc-500 dark:placeholder-yellow-300/50 focus:ring-0 resize-none"
                style={{ fontFamily: 'cursive' }}
            />
        </div>
    );
};