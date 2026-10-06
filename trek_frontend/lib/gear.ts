import api from './axios';

export const getGear = async (params?: any) => {
  const res = await api.get('/gear/', { params });
  return res.data;
};
export const getFeaturedGear = async () => {
  const res = await api.get('/gear/featured/');
  return res.data;
};
export const getGearBySlug = async (slug: string) => {
  const res = await api.get(`/gear/${slug}/`);
  return res.data;
};
export const getGearCategories = async () => {
  const res = await api.get('/gear/categories/');
  return res.data;
};