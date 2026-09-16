import api from './axios';

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),

  getConversation: () => api.get('/ai/conversation'),

  clearConversation: () => api.delete('/ai/conversation'),
};