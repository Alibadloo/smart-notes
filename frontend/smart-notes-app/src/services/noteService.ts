import api from './api';
import type { Note, NoteVersion, CreateNotePayload, UpdateNotePayload } from '../types';

export const noteService = {
  async getAll(params?: { search?: string; categoryId?: number; status?: string }): Promise<Note[]> {
    const res = await api.get<Note[]>('/notes', { params });
    return res.data;
  },

  async getById(id: number): Promise<Note> {
    const res = await api.get<Note>(`/notes/${id}`);
    return res.data;
  },

  async create(data: CreateNotePayload): Promise<Note> {
    const res = await api.post<Note>('/notes', data);
    return res.data;
  },

  async update(id: number, data: UpdateNotePayload): Promise<Note> {
    const res = await api.put<Note>(`/notes/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async archive(id: number): Promise<void> {
    await api.post(`/notes/${id}/archive`);
  },

  async getVersions(id: number): Promise<NoteVersion[]> {
    const res = await api.get<NoteVersion[]>(`/notes/${id}/versions`);
    return res.data;
  },

  async uploadAttachment(noteId: number, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await api.post(`/notes/${noteId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteAttachment(noteId: number, attachmentId: number): Promise<void> {
    await api.delete(`/notes/${noteId}/attachments/${attachmentId}`);
  },
};
