import axios from 'axios';
import { authService } from './authService';
import type { MemberResponse } from './authService';

class MemberService {
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

  async searchMembers(params: { name?: string; mobile?: string; username?: string }): Promise<MemberResponse[]> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append('name', params.name);
    if (params.mobile) searchParams.append('mobile', params.mobile);
    if (params.username) searchParams.append('username', params.username);
    const { data } = await this.api.get<MemberResponse[]>(`/members/search?${searchParams.toString()}`);
    return data;
  }

  // GET /api/comittes/{id}/members
  async getByCommittee(comitteId: number): Promise<MemberResponse[]> {
    const { data } = await this.api.get<MemberResponse[]>(`/comittes/${comitteId}/members`);
    return data;
  }
}

export const memberService = new MemberService();
