import axios from 'axios';
import type { User } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.apiClient.post<LoginResponse>('/api/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const response = await this.apiClient.get<User>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await this.apiClient.post<{ token: string }>('/api/auth/refresh');
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  }
}

export const authService = new AuthService();