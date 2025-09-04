import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Dashboard Stats
export const getDashboardStats = () => api.get('/dashboard-stats/');

// Excel Upload
export const uploadExcelFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/excel-uploads/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getExcelUploads = () => api.get('/excel-uploads/');

export const reprocessUpload = (uploadId) => api.post(`/excel-uploads/${uploadId}/reprocess/`);

// Proposals
export const getProposals = (params) => api.get('/proposals/', { params });

export const getProposal = (id) => api.get(`/proposals/${id}/`);

export const createProposal = (data) => api.post('/proposals/', data);

export const updateProposal = (id, data) => api.put(`/proposals/${id}/`, data);

export const deleteProposal = (id) => api.delete(`/proposals/${id}/`);

// Scopes
export const getScopes = (params) => api.get('/scopes/', { params });

export const getScope = (id) => api.get(`/scopes/${id}/`);

export const createScope = (data) => api.post('/scopes/', data);

export const updateScope = (id, data) => api.put(`/scopes/${id}/`, data);

export const deleteScope = (id) => api.delete(`/scopes/${id}/`);

// VAPT Results
export const getVaptResults = (params) => api.get('/vapt-results/', { params });

export const getVaptResult = (id) => api.get(`/vapt-results/${id}/`);

export const createVaptResult = (data) => api.post('/vapt-results/', data);

export const updateVaptResult = (id, data) => api.put(`/vapt-results/${id}/`, data);

export const deleteVaptResult = (id) => api.delete(`/vapt-results/${id}/`);

// Analytics
export const getVulnerabilityAnalytics = (params) => api.get('/vulnerability-analytics/', { params });

export const getTimelineAnalysis = (params) => api.get('/timeline-analysis/', { params });

export const getKpiMetrics = (params) => api.get('/kpi-metrics/', { params });

// Export
export const exportData = (params) => api.get('/export-data/', { params });

// Reset Dataset
export const resetDataset = () => api.post('/reset-dataset/');

export default api;