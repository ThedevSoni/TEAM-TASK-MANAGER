import axios from 'axios';

// Central Axios client for every backend API request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Add the saved JWT to requests after login/signup.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('team_task_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the backend says the token is invalid, clear the local session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('team_task_token');
      localStorage.removeItem('team_task_user');
    }

    return Promise.reject(error);
  }
);

// Auth endpoints used by Login and AuthContext.
export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

// Project endpoints used by the Projects page.
export const projectApi = {
  list: () => api.get('/projects'),
  create: (payload) => api.post('/projects', payload),
  get: (id) => api.get(`/projects/${id}`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members`, { data: { userId } })
};

// Task endpoints used by the board and task form.
export const taskApi = {
  list: (projectId) => api.get('/tasks', { params: projectId ? { project: projectId } : {} }),
  create: (payload) => api.post('/tasks', payload),
  update: (id, payload) => api.patch(`/tasks/${id}`, payload),
  remove: (id) => api.delete(`/tasks/${id}`)
};

// Dashboard summary endpoint.
export const dashboardApi = {
  get: () => api.get('/dashboard')
};

// User list endpoint for assignment/member dropdowns.
export const userApi = {
  list: () => api.get('/users')
};

export default api;
