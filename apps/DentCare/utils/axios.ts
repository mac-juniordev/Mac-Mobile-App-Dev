import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_URL = 'http://192.168.62.155:5000/api';
const PROD_URL = 'https://api.dentcare.com/api';

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getCurrentUser: () => api.get('/auth/me'),

  updateProfile: (data: any) => api.put('/auth/profile', data),

  updatePreferences: (preferences: any) =>
    api.put('/auth/preferences', { preferences }),

  logout: () => api.post('/auth/logout'),

  uploadProfilePicture: async (imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('profilePicture', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    return api.post('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationAPI = {
  getAll: (params?: { limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),

  getUnreadCount: () => api.get('/notifications/unread-count'),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),

  clearAll: () => api.delete('/notifications'),
};

// ============================================
// APPOINTMENTS
// ============================================
export const appointmentAPI = {
  create: (data: {
    dentistId: string;
    service: string;
    date: Date;
    time: string;
    notes?: string;
    estimatedCost?: number;
  }) => api.post('/appointments', data),

  getAll: (params?: { status?: string; upcoming?: boolean }) =>
    api.get('/appointments', { params }),

  getById: (id: string) => api.get(`/appointments/${id}`),

  getStats: () => api.get('/appointments/stats'),

  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),

  reschedule: (id: string, data: { date: Date; time: string }) =>
    api.put(`/appointments/${id}/reschedule`, data),

  getTicket: (id: string) => api.get(`/appointments/${id}/ticket`),
};

// ============================================
// DENTISTS
// ============================================
export const dentistAPI = {
  getAll: (params?: any) => api.get('/dentists', { params }),
  getById: (id: string) => api.get(`/dentists/${id}`),
  search: (q: string) => api.get(`/dentists/search?q=${q}`),
  getAvailability: (id: string) => api.get(`/dentists/${id}/availability`),
};

export default api;