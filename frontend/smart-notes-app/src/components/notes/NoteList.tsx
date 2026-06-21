import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchNotes, setSelectedNote, createNote } from '../../store/noteSlice';
import { Plus, Search, Pin, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '../../types';

export default function NoteList() {
  const dispatch = useAppDispatch();
  const { notes, loading, selectedNote, selectedCategoryId, selectedStatus } = useAppSelector(s => s.notes);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchNotes({
      search: search || undefined,
      categoryId: selectedCategoryId ?? undefined,
      status: selectedStatus !== 'All' ? selectedStatus : undefined,
    }));
  }, [dispatch, selectedCategoryId, selectedStatus]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const q = e.target.value;
    setTimeout(() => {
      dispatch(fetchNotes({
        search: q || undefined,
        categoryId: selectedCategoryId ?? undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      }));
    }, 300);
  };

  const handleNew = async () => {
    const note = await dispatch(createNote({ title: 'Untitled Note', content: '', tags: [] }));
    if (createNote.fulfilled.match(note)) {
      dispatch(setSelectedNote(note.payload));
    }
  };

  return (
    <div className="w-72 h-screen bg-slate-800/50 border-r border-slate-700/50 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white capitalize">{selectedStatus} Notes</h2>
          <button
            onClick={handleNew}
            className="w-7 h-7 rounded-lg bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors"
          >
            <Plus size={14} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full bg-slate-700/50 text-sm text-white rounded-lg pl-8 pr-3 py-2 outline-none border border-slate-600/50 focus:border-indigo-500 placeholder-slate-500"
            placeholder="Search notes..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <p className="text-sm">No notes found</p>
            <button onClick={handleNew} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">
              Create one
            </button>
          </div>
        )}

        {notes.map((note: Note) => (
          <NoteItem
            key={note.id}
            note={note}
            isSelected={selectedNote?.id === note.id}
            onClick={() => dispatch(setSelectedNote(note))}
          />
        ))}
      </div>
    </div>
  );
}

function NoteItem({ note, isSelected, onClick }: { note: Note; isSelected: boolean; onClick: () => void }) {
  const preview = note.content.replace(/[#*`>\-]/g, '').trim().slice(0, 80);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-700/30 transition-colors ${
        isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-slate-700/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-white truncate flex-1">{note.title || 'Untitled'}</h3>
        {note.isPinned && <Pin size={11} className="text-indigo-400 flex-shrink-0 mt-0.5" />}
      </div>

      {preview && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{preview}</p>
      )}

      <div className="flex items-center gap-2">
        {note.categoryName && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${note.categoryColor}20`, color: note.categoryColor }}>
            {note.categoryName}
          </span>
        )}
        {note.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs text-slate-500 flex items-center gap-0.5">
            <Tag size={9} />{tag}
          </span>
        ))}
        <span className="text-xs text-slate-600 ml-auto">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}
