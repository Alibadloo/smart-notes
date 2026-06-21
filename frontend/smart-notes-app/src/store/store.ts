import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import noteReducer from './noteSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: noteReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
