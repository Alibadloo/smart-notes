import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Note, CreateNotePayload, UpdateNotePayload } from '../types';
import { noteService } from '../services/noteService';

interface NoteState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategoryId: number | null;
  selectedStatus: string;
}

const initialState: NoteState = {
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategoryId: null,
  selectedStatus: 'Active',
};

export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async (params: { search?: string; categoryId?: number; status?: string } = {}) => {
    return await noteService.getAll(params);
  }
);

export const createNote = createAsyncThunk(
  'notes/create',
  async (data: CreateNotePayload) => {
    return await noteService.create(data);
  }
);

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, data }: { id: number; data: UpdateNotePayload }) => {
    return await noteService.update(id, data);
  }
);

export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id: number) => {
    await noteService.delete(id);
    return id;
  }
);

export const archiveNote = createAsyncThunk(
  'notes/archive',
  async (id: number) => {
    await noteService.archive(id);
    return id;
  }
);

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote(state, action: PayloadAction<Note | null>) {
      state.selectedNote = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<number | null>) {
      state.selectedCategoryId = action.payload;
    },
    setSelectedStatus(state, action: PayloadAction<string>) {
      state.selectedStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => { state.loading = true; })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state) => { state.loading = false; })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
        state.selectedNote = action.payload;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const idx = state.notes.findIndex(n => n.id === action.payload.id);
        if (idx !== -1) state.notes[idx] = action.payload;
        if (state.selectedNote?.id === action.payload.id) state.selectedNote = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n.id !== action.payload);
        if (state.selectedNote?.id === action.payload) state.selectedNote = null;
      })
      .addCase(archiveNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n.id !== action.payload);
        if (state.selectedNote?.id === action.payload) state.selectedNote = null;
      });
  },
});

export const { setSelectedNote, setSearchQuery, setSelectedCategory, setSelectedStatus } = noteSlice.actions;
export default noteSlice.reducer;
