import api from './api';

export const createOrder = async (addressId: string) => {
  const res = await api.post('/orders', { addressId });
  return res.data;
};

export const getUserOrders = async () => {
  const res = await api.get('/orders/my');
  return res.data;
};