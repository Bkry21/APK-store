import api from './api';

export const getCart = async (userId: string) => {
  const res = await api.get(`/cart/${userId}`);
  return res.data;
};

export const addToCart = async (userId: string, productId: string, quantity: number) => {
  const res = await api.post(`/cart/${userId}/items`, { productId, quantity });
  return res.data;
};

export const updateCartQuantity = async (userId: string, itemId: string, quantity: number) => {
  const res = await api.put(`/cart/${userId}/items/${itemId}`, { quantity });
  return res.data;
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const res = await api.delete(`/cart/${userId}/items/${itemId}`);
  return res.data;
};