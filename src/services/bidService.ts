import axios from 'axios';
import { authService } from './authService';
import type { BidResponseDTO } from '../types/bid';

class BidService {
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
  }

  // GET /api/comittes/{id}/bids
  async getByCommittee(comitteId: number) {
    const { data } = await this.api.get<BidResponseDTO[]>(`/comittes/${comitteId}/bids`);
    return data;
  }
}

export const bidService = new BidService();
