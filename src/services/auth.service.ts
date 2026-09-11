import api, { setToken } from './api';

export const register = async (name: string, email: string, password: string) => {
  try {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.token) {
      setToken(res.data.token);
    }
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    
    // التأكد من وجود الـ Token وتخزينه بلطف
    const token = res.data?.token || res.data?.accessToken;
    if (token) {
      setToken(token);
    }
    
    return res.data;
  } catch (error: any) {
    // تمرير الخطأ بوضوح ليتم التقاطه في الواجهة (LoginScreen) وعرضه للمستخدم
    throw error;
  }
};