import axios from 'axios';
import { authService } from './authService';
import { sessionRefresh } from '../utils/sessionRefresh';
import type {
  ConfirmPropertyMediaRequest,
  MediaPresignRequest,
  MediaPresignResponse,
  PropertyMedia,
} from '../types/property';

class PropertyMediaService {
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

  async presignUpload(payload: MediaPresignRequest): Promise<MediaPresignResponse> {
    const { data } = await this.api.post<MediaPresignResponse>('/v1/properties/media/presign', payload);
    return data;
  }

  async uploadToPresignedUrl(uploadUrl: string, file: File, requiredHeaders: Record<string, string> = {}): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': file.type || 'application/octet-stream',
      ...requiredHeaders,
    };
    await axios.put(uploadUrl, file, { headers });
  }

  async confirmMedia(propertyId: number, payload: ConfirmPropertyMediaRequest): Promise<PropertyMedia> {
    const { data } = await this.api.post<PropertyMedia>(`/v1/properties/${propertyId}/media/confirm`, payload);
    return data;
  }

  async getPropertyMedia(propertyId: number): Promise<PropertyMedia[]> {
    const { data } = await this.api.get<PropertyMedia[]>(`/v1/properties/${propertyId}/media`);
    return data;
  }
}

export const propertyMediaService = new PropertyMediaService();
