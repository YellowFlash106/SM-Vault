 import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export interface SignupData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
    };
  };
}

export const authAPI = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Vault APIs
export interface EncryptedVaultData {
  encrypted: string;
  salt: string;
  iv: string;
}

export interface VaultItemResponse {
  _id: string;
  userId: string;
  encryptedData: EncryptedVaultData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultItemData {
  encryptedData: EncryptedVaultData;
}

export const vaultAPI = {
  create: async (data: CreateVaultItemData) => {
    const response = await api.post('/vault', data);
    return response.data;
  },

  getAll: async (): Promise<{ success: boolean; data: { items: VaultItemResponse[] } }> => {
    const response = await api.get('/vault');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/vault/${id}`);
    return response.data;
  },

  update: async (id: string, data: CreateVaultItemData) => {
    const response = await api.put(`/vault/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vault/${id}`);
    return response.data;
  },

  deleteAll: async () => {
    const response = await api.delete('/vault');
    return response.data;
  }
};

export default api;