import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Category, CreateCategoryPayload } from '../types';
import { categoryService } from '../services/categoryService';

interface CategoryState {
  categories: Category[];
  loading: boolean;
}

const initialState: CategoryState = { categories: [], loading: false };

export const fetchCategories = createAsyncThunk('categories/fetchAll', async () => {
  return await categoryService.getAll();
});

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CreateCategoryPayload) => categoryService.create(data)
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number) => {
    await categoryService.delete(id);
    return id;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
