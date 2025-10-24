import axios from 'axios';
import { authService } from './authService';
import type { BidResponseDTO, BidRequest } from '../types/bid';

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

  // GET /api/bids/member/{memberId}/committee-bids
  async getByMember(memberId: number) {
    const { data } = await this.api.get<BidResponseDTO[]>(`/bids/member/${memberId}/committee-bids`);
    return data;
  }

  // POST /api/bids
  async createBid(bidRequest: BidRequest): Promise<BidResponseDTO> {
    const { data } = await this.api.post<BidResponseDTO>('/bids', bidRequest);
    return data;
  }

  // PUT /api/bids/{bidId}
  async updateBid(bidId: string, bidRequest: BidRequest): Promise<BidResponseDTO> {
    const { data } = await this.api.put<BidResponseDTO>(`/bids/${bidId}`, bidRequest);
    return data;
  }
}

export const bidService = new BidService();
