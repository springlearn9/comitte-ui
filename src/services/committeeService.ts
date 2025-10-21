import axios from 'axios';
import { authService } from './authService';
import type { ComitteRequestDTO, ComitteResponseDTO } from '../types/committee';

class CommitteeService {
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

  // GET /api/comittes/owner/{ownerId}
  async getByOwner(ownerId: number): Promise<ComitteResponseDTO[]> {
    const { data } = await this.api.get<ComitteResponseDTO[]>(`/comittes/owner/${ownerId}`);
    return data;
  }

  // GET /api/comittes/member/{memberId}
  async getByMember(memberId: number): Promise<ComitteResponseDTO[]> {
    const { data } = await this.api.get<ComitteResponseDTO[]>(`/comittes/member/${memberId}`);
    return data;
  }

  // GET /api/comittes/{id}
  async getById(id: number): Promise<ComitteResponseDTO> {
    const { data } = await this.api.get<ComitteResponseDTO>(`/comittes/${id}`);
    return data;
  }

  // POST /api/comittes
  async create(payload: ComitteRequestDTO): Promise<ComitteResponseDTO> {
    const { data } = await this.api.post<ComitteResponseDTO>('/comittes', payload);
    return data;
  }

  // PUT /api/comittes/{id}
  async update(id: number, payload: ComitteRequestDTO): Promise<ComitteResponseDTO> {
    const { data } = await this.api.put<ComitteResponseDTO>(`/comittes/${id}`, payload);
    return data;
  }

  // DELETE /api/comittes/{id}
  async delete(id: number): Promise<void> {
    await this.api.delete(`/comittes/${id}`);
  }

  // POST /api/comitte-member-map
  // Attaches a member to a committee with share count
  async addMember(comitteId: number, memberId: number, shareCount: number = 1): Promise<void> {
    await this.api.post('/comitte-member-map', {
      comitteId,
      memberId,
      shareCount
    });
  }
}

export const committeeService = new CommitteeService();
