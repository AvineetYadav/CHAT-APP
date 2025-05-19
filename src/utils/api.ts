import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData: RegisterData) => api.post('/auth/register', userData),
  login: (credentials: LoginData) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData: UpdateProfileData) => api.put('/auth/profile', userData),
  uploadAvatar: (formData: FormData) => api.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Conversation endpoints
export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  getConversation: (id: string) => api.get(`/conversations/${id}`),
  createConversation: (data: CreateConversationData) => api.post('/conversations', data),
  updateConversation: (id: string, data: UpdateConversationData) => api.put(`/conversations/${id}`, data),
  deleteConversation: (id: string) => api.delete(`/conversations/${id}`),
  addUserToGroup: (conversationId: string, userId: string) => 
    api.post(`/conversations/${conversationId}/users`, { userId }),
  removeUserFromGroup: (conversationId: string, userId: string) => 
    api.delete(`/conversations/${conversationId}/users/${userId}`),
};

// Message endpoints
export const messageAPI = {
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  sendMessage: (data: SendMessageData) => api.post('/messages', data),
  deleteMessage: (id: string) => api.delete(`/messages/${id}`),
  uploadImage: (formData: FormData) => api.post('/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// User endpoints
export const userAPI = {
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
  getUserById: (id: string) => api.get(`/users/${id}`),
};

// Types
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
}

export interface CreateConversationData {
  isGroup: boolean;
  name?: string;
  userIds: string[];
}

export interface UpdateConversationData {
  name?: string;
  groupImage?: string;
}

export interface SendMessageData {
  content: string;
  conversationId: string;
  image?: string;
}

export default api;