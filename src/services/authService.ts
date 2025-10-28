import axios from 'axios';
import type { User } from '../contexts/AuthContext';

// API Request/Response interfaces matching backend DTOs
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface PasswordResetRequest {
  usernameOrEmail: string;
}

export interface PasswordUpdateRequest {
  token: string;
  usernameOrEmail: string;
  otp: string;
  newPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: any;
}

export interface MemberResponse {
  memberId: number;
  username: string;
  email: string;
  name: string;
  mobile?: string;
  aadharNo?: string;
  address?: string;
  dob?: string; // Date of birth field
  createdTimestamp: string;
  updatedTimestamp?: string;
}

export interface CommitteMemberMapResponse {
  id: number;
  comitteId: number;
  memberId: number;
  comitteName: string;
  memberName: string;
  memberMobile: string;
  shareCount: number;
  createdTimestamp: string;
  updatedTimestamp: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private apiClient = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  constructor() {
    // Add request interceptor to include token
    this.apiClient.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    try {
      const loginRequest: LoginRequest = {
        usernameOrEmail,
        password
      };
      
      const response = await this.apiClient.post<LoginResponse>('/auth/login', loginRequest);
      const { accessToken, user } = response.data;
      
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      throw new Error(errorMessage);
    }
  }

  async register(userData: RegisterRequest): Promise<MemberResponse> {
    try {
      const response = await this.apiClient.post<MemberResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  async requestPasswordReset(usernameOrEmail: string): Promise<string> {
    try {
      const request: PasswordResetRequest = { usernameOrEmail };
      const response = await this.apiClient.post('/password/request-reset', request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset request failed';
      throw new Error(errorMessage);
    }
  }

  async resetPassword(token: string, usernameOrEmail: string, otp: string, newPassword: string): Promise<string> {
    try {
      const request: PasswordUpdateRequest = {
        token,
        usernameOrEmail,
        otp,
        newPassword
      };
      const response = await this.apiClient.post('/password/reset', request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();