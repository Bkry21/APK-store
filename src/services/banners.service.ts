import api from './api';

export const getBanners = async () => {
  const res = await api.get('/banners');
  return res.data;
};

export const getAdminBanners = async () => {
  const res = await api.get('/banners/admin');
  return res.data;
};

export const createBanner = async (data: {
  image: string;
  title?: string;
  subtitle?: string;
  duration?: number;
  order?: number;
}) => {
  const res = await api.post('/banners', data);
  return res.data;
};

export const updateBanner = async (id: string, data: Partial<{
  image: string;
  title: string;
  subtitle: string;
  duration: number;
  order: number;
  isActive: boolean;
}>) => {
  const res = await api.patch(`/banners/${id}`, data);
  return res.data;
};

export const deleteBanner = async (id: string) => {
  const res = await api.delete(`/banners/${id}`);
  return res.data;
};