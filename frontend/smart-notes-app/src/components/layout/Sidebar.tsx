import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { setSelectedCategory, setSelectedStatus } from '../../store/noteSlice';
import { fetchNotes } from '../../store/noteSlice';
import { fetchCategories, createCategory, deleteCategory } from '../../store/categorySlice';
import { logout } from '../../store/authSlice';
import { useEffect } from 'react';
import {
  NotebookPen, Archive, Trash2, Plus, LogOut,
  Briefcase, User, BookOpen, Folder, Tag
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  work: <Briefcase size={14} />,
  person: <User size={14} />,
  school: <BookOpen size={14} />,
  folder: <Folder size={14} />,
};

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { categories } = useAppSelector(s => s.categories);
  const { selectedCategoryId, selectedStatus } = useAppSelector(s => s.notes);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const selectView = (status: string, categoryId: number | null = null) => {
    dispatch(setSelectedStatus(status));
    dispatch(setSelectedCategory(categoryId));
    dispatch(fetchNotes({ status: status !== 'All' ? status : undefined, categoryId: categoryId ?? undefined }));
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await dispatch(createCategory({ name: newCatName.trim(), color: newCatColor, icon: 'folder' }));
    setNewCatName('');
    setShowNewCat(false);
    dispatch(fetchCategories());
  };

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-700/50 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <NotebookPen size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">SmartNotes</h1>
            <p className="text-xs text-slate-400">Knowledge Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">Views</p>

        {[
          { label: 'All Notes', icon: <NotebookPen size={15} />, status: 'Active' },
          { label: 'Archived', icon: <Archive size={15} />, status: 'Archived' },
          { label: 'Trash', icon: <Trash2 size={15} />, status: 'Deleted' },
        ].map(item => (
          <button
            key={item.status}
            onClick={() => selectView(item.status)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedStatus === item.status && !selectedCategoryId
                ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Categories</p>
            <button
              onClick={() => setShowNewCat(!showNewCat)}
              className="text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {showNewCat && (
            <div className="mx-2 mb-2 p-2 bg-slate-800 rounded-lg space-y-2">
              <input
                className="w-full bg-slate-700 text-white text-xs rounded px-2 py-1.5 outline-none border border-slate-600 focus:border-indigo-500"
                placeholder="Category name..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                <button onClick={handleAddCategory}
                  className="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded px-2 py-1">
                  Add
                </button>
              </div>
            </div>
          )}

          {categories.map(cat => (
            <div key={cat.id} className="group relative">
              <button
                onClick={() => selectView('Active', cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategoryId === cat.id
                    ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span style={{ color: cat.color }}>{CATEGORY_ICONS[cat.icon] ?? <Tag size={14} />}</span>
                <span className="flex-1 text-left">{cat.name}</span>
                <span className="text-xs text-slate-500">{cat.noteCount}</span>
              </button>
              {!cat.isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(deleteCategory(cat.id)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button onClick={() => dispatch(logout())} className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
