import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { updateNote, deleteNote, archiveNote, fetchNotes } from '../../store/noteSlice';
import { useAutoSave } from '../../hooks/useAutoSave';
import {
  Pin, PinOff, Archive, Trash2, Tag as TagIcon,
  Clock, Paperclip, History, Save, Check
} from 'lucide-react';
import { noteService } from '../../services/noteService';
import type { NoteVersion } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';

export default function NoteEditor() {
  const dispatch = useAppDispatch();
  const { selectedNote, selectedStatus, selectedCategoryId } = useAppSelector(s => s.notes);
  const { categories } = useAppSelector(s => s.categories);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags(selectedNote.tags);
      setSaveStatus('idle');
    }
  }, [selectedNote?.id]);

  useAutoSave(selectedNote?.id, title, content);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    setSaveStatus('saving');
    await dispatch(updateNote({ id: selectedNote.id, data: { title, content, tags } }));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handlePin = async () => {
    if (!selectedNote) return;
    await dispatch(updateNote({ id: selectedNote.id, data: { isPinned: !selectedNote.isPinned } }));
  };

  const handleArchive = async () => {
    if (!selectedNote) return;
    await dispatch(archiveNote(selectedNote.id));
    dispatch(fetchNotes({ status: selectedStatus, categoryId: selectedCategoryId ?? undefined }));
  };

  const handleDelete = async () => {
    if (!selectedNote || !confirm('Move this note to trash?')) return;
    await dispatch(deleteNote(selectedNote.id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      dispatch(updateNote({ id: selectedNote!.id, data: { tags: newTags } }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    dispatch(updateNote({ id: selectedNote!.id, data: { tags: newTags } }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    dispatch(updateNote({ id: selectedNote!.id, data: { categoryId: val ? Number(val) : undefined } }));
  };

  const loadVersions = async () => {
    if (!selectedNote) return;
    const v = await noteService.getVersions(selectedNote.id);
    setVersions(v);
    setShowVersions(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNote || !e.target.files?.[0]) return;
    await noteService.uploadAttachment(selectedNote.id, e.target.files[0]);
    e.target.value = '';
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">Select a note to edit</p>
          <p className="text-xs text-slate-600 mt-1">or create a new one from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={handlePin}
            className={`p-2 rounded-lg text-xs transition-colors ${
              selectedNote.isPinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
            title={selectedNote.isPinned ? 'Unpin' : 'Pin'}
          >
            {selectedNote.isPinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>

          <button onClick={handleArchive}
            className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Archive"
          >
            <Archive size={15} />
          </button>

          <button onClick={handleDelete}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <label className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer" title="Attach file">
            <Paperclip size={15} />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <button onClick={loadVersions}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title="Version history"
          >
            <History size={15} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={11} />
            {formatDistanceToNow(new Date(selectedNote.updatedAt), { addSuffix: true })}
          </span>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {saveStatus === 'saved' ? <Check size={13} /> : <Save size={13} />}
            {saveStatus === 'saved' ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <input
          className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder-slate-600"
          placeholder="Note title..."
          value={title}
          onChange={handleTitleChange}
        />

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <select
            value={selectedNote.categoryId ?? ''}
            onChange={handleCategoryChange}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
          >
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 flex-wrap">
            {tags.map(tag => (
              <span key={tag}
                onClick={() => handleRemoveTag(tag)}
                className="text-xs flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <TagIcon size={9} />{tag} ×
              </span>
            ))}
            <input
              className="text-xs bg-transparent text-slate-400 outline-none w-20 placeholder-slate-600"
              placeholder="+ add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden px-6 pb-6" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={v => setContent(v ?? '')}
          height="100%"
          preview="live"
          style={{ height: '100%' }}
        />
      </div>

      {/* Version History Panel */}
      {showVersions && (
        <div className="absolute right-0 top-0 h-full w-72 bg-slate-800 border-l border-slate-700 shadow-2xl z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">Version History</h3>
            <button onClick={() => setShowVersions(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {versions.map(v => (
              <div key={v.id} className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs font-medium text-white">Version {v.versionNumber}</p>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(v.createdAt), 'MMM d, yyyy HH:mm')}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.content.slice(0, 60)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
