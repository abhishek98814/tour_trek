import api from './axios';
import useAuthStore from '../store/authStore'; // 👈 adjust path to your actual store file

export const loginUser = async (data: { username: string; password: string }) => {
  const res = await api.post('/auth/login/', data);
  useAuthStore.getState().setAuth(res.data.user, res.data.access, res.data.refresh);
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await api.post('/auth/register/', data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile/');
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.put('/auth/profile/', data);
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/auth/admin/stats/');
  return res.data;
};

export const getAdminUsers = async (params?: any) => {
  const res = await api.get('/auth/admin/users/', { params });
  return res.data;
};