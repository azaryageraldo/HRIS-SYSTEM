import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, AuthUser } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url);
    return response.data;
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/auth/login', credentials);
  }

  async register(data: RegisterRequest): Promise<ApiResponse> {
    return this.post('/auth/register', data);
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return this.get<AuthUser>('/auth/me');
  }

  async logout(): Promise<ApiResponse> {
    return this.post('/auth/logout');
  }
}

export const apiClient = new ApiClient();
