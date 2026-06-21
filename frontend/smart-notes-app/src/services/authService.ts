import api from './api';
import type { User } from '../types';

interface LoginPayload { email: string; password: string }
interface RegisterPayload { fullName: string; email: string; password: string }

export const authService = {
  async login(data: LoginPayload): Promise<User> {
    const res = await api.post<User>('/auth/login', data);
    return res.data;
  },
  async register(data: RegisterPayload): Promise<User> {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },
};
