import api from './api';

export const registerPushToken = (token: string) =>
  api.post('/notifications/register-token', { token });

export const getNotifications = () =>
  api.get('/notifications');

export const getUnreadCount = () =>
  api.get('/notifications/unread-count');

export const markAsRead = (id: string) =>
  api.put(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  api.put('/notifications/mark-all-read');