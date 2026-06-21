import api from './api';
import type { Category, CreateCategoryPayload } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  async create(data: CreateCategoryPayload): Promise<Category> {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },

  async update(id: number, data: CreateCategoryPayload): Promise<Category> {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
