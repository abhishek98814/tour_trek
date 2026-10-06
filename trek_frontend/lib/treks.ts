import api from './axios';

export const getTreks = async (params?: any) => {
  const res = await api.get('/treks/', { params });
  return res.data;
};
export const getFeaturedTreks = async () => {
  const res = await api.get('/treks/featured/');
  return res.data;
};
export const getTrekBySlug = async (slug: string) => {
  const res = await api.get(`/treks/${slug}/`);
  return res.data;
};
export const getTrekCategories = async () => {
  const res = await api.get('/treks/categories/');
  return res.data;
};