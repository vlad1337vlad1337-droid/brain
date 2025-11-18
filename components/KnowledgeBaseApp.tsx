import React, { useState, useMemo, useEffect, useRef } from 'react';
import { KnowledgeNote } from '../types';
import { EmptyState } from './EmptyState';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


export const NotesView: React.FC<{
    notes: KnowledgeNote[];
    onSaveNote: (note: KnowledgeNote) => void;
    onDeleteNote: (noteId: string) => void;
}> = ({ notes, onSaveNote, onDeleteNote }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentContent, setCurrentContent] = useState('');
    const contentRef = useRef<HTMLTextAreaElement>(null);
    
    const debouncedTitle = useDebounce(currentTitle, 500);
    const debouncedContent = useDebounce(currentContent, 500);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => 
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                note.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.createdAt).getTime());
    }, [notes, searchTerm]);
    
    const selectedNote = useMemo(() => {
        return notes.find(n => n.id === selectedNoteId);
    }, [notes, selectedNoteId]);

    useEffect(() => {
        if (selectedNote) {
            setCurrentTitle(selectedNote.title);
            setCurrentContent(selectedNote.content);
        } else {
            setCurrentTitle('');
            setCurrentContent('');
        }
    }, [selectedNote]);
    
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
        }
    }, [currentContent]);

    // Auto-save logic
    useEffect(() => {
        if (selectedNote && (debouncedTitle !== selectedNote.title || debouncedContent !== selectedNote.content)) {
            if (debouncedTitle.trim() === '') return; // Don't save if title is empty
            onSaveNote({
                ...selectedNote,
                title: debouncedTitle,
                content: debouncedContent,
                updatedAt: new Date(),
            });
        }
    }, [debouncedTitle, debouncedContent, selectedNote, onSaveNote]);
    

    const handleNewNote = () => {
        const newNote: KnowledgeNote = {
            id: `kn-${Date.now()}`,
            title: 'Новая заметка',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        onSaveNote(newNote);
        setSelectedNoteId(newNote.id);
    };

    const handleDeleteNote = () => {
        if (selectedNoteId && window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
            onDeleteNote(selectedNoteId);
            setSelectedNoteId(null);
        }
    };

    return (
        <div className="flex h-full bg-slate-100 dark:bg-zinc-800">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Заметки</h2>
                    <button onClick={handleNewNote} className="px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 text-sm font-semibold transition-colors" title="Создать новую заметку">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="relative mb-4">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                </div>
                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                    {filteredNotes.length > 0 ? filteredNotes.map(note => (
                        <button key={note.id} onClick={() => setSelectedNoteId(note.id)}
                            className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${selectedNoteId === note.id ? 'bg-violet-100 dark:bg-violet-900/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
                        >
                            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{note.title}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{note.content || 'Нет содержимого'}</p>
                        </button>
                    )) : <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-8">Ничего не найдено.</div>}
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedNote ? (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <input
                            type="text"
                            value={currentTitle}
                            onChange={e => setCurrentTitle(e.target.value)}
                            className="w-full bg-transparent text-3xl font-bold border-0 focus:ring-0 p-0 mb-4 text-zinc-800 dark:text-zinc-100"
                        />
                         <p className="text-sm text-zinc-400 mb-6">
                            Последнее изменение: {new Date(selectedNote.updatedAt).toLocaleString('ru-RU')}
                         </p>
                        <textarea
                            ref={contentRef}
                            value={currentContent}
                            onChange={e => setCurrentContent(e.target.value)}
                            placeholder="Начните писать..."
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 resize-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg"
                        />
                        <button onClick={handleDeleteNote} className="mt-8 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-500/20 transition-colors">
                            <i className="fa-solid fa-trash mr-2"></i>
                            Удалить заметку
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <EmptyState illustration="ideas" message="Выберите заметку для просмотра или создайте новую." />
                    </div>
                )}
            </div>
        </div>
    );
};