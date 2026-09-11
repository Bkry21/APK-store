import api from './api';

export const getUserAddresses = async (userId: string) => {
  const res = await api.get(`/addresses/user/${userId}`);
  return res.data;
};

export const createAddress = async (userId: string, street: string, city: string) => {
  const res = await api.post('/addresses', { userId, street, city });
  return res.data;
};