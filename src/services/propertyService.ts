import axios from 'axios';
import { authService } from './authService';
import { sessionRefresh } from '../utils/sessionRefresh';
import type { PageResponse, PropertyFilters, PropertyRequest, PropertyResponse } from '../types/property';

class PropertyService {
  private api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => {
        sessionRefresh.refresh();
        return response;
      },
      (error) => Promise.reject(error)
    );
  }

  async create(data: PropertyRequest): Promise<PropertyResponse> {
    const { data: response } = await this.api.post<PropertyResponse>('/v1/properties', data);
    return response;
  }

  async update(id: number, data: PropertyRequest): Promise<PropertyResponse> {
    const { data: response } = await this.api.put<PropertyResponse>(`/v1/properties/${id}`, data);
    return response;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete(`/v1/properties/${id}`);
  }

  async getById(id: number): Promise<PropertyResponse> {
    const { data } = await this.api.get<PropertyResponse>(`/v1/properties/${id}`);
    return data;
  }

  async getMyListings(page = 0, size = 20): Promise<PageResponse<PropertyResponse>> {
    const { data } = await this.api.get<PageResponse<PropertyResponse>>('/v1/properties/my-listings', {
      params: { page, size, sortBy: 'id', direction: 'DESC' },
    });
    return data;
  }

  async search(filters: PropertyFilters = {}, page = 0, size = 20): Promise<PageResponse<PropertyResponse>> {
    const params: Record<string, string | number> = {
      page,
      size,
      sortBy: 'id',
      direction: 'DESC',
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value as string | number;
      }
    });

    const { data } = await this.api.get<PageResponse<PropertyResponse>>('/v1/properties', { params });
    return data;
  }
}

export const propertyService = new PropertyService();
