import { apiClient } from './api';

export const authAPI = {
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};