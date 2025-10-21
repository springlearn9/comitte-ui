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
}

export const committeeService = new CommitteeService();
