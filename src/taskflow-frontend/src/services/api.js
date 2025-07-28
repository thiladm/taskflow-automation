import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  async register(username, email, password) {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Lists service
export const listsService = {
  async getAllLists() {
    const response = await api.get('/lists');
    return response.data;
  },

  async getList(id) {
    const response = await api.get(`/lists/${id}`);
    return response.data;
  },

  async createList(listData) {
    const response = await api.post('/lists', listData);
    return response.data;
  },

  async updateList(id, listData) {
    const response = await api.put(`/lists/${id}`, listData);
    return response.data;
  },

  async deleteList(id) {
    const response = await api.delete(`/lists/${id}`);
    return response.data;
  },
};

// Tasks service
export const tasksService = {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getTasksForList(listId) {
    const response = await api.get(`/tasks/list/${listId}`);
    return response.data;
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api;
