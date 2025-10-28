import axios from 'axios';
import { authService, type MemberResponse, type CommitteMemberMapResponse } from './authService';

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

  // GET /api/members/{id}
  async getMemberById(memberId: number): Promise<MemberResponse> {
    const { data } = await this.api.get<MemberResponse>(`/members/${memberId}`);
    return data;
  }

  // PUT /api/members/{id}
  async updateMember(memberId: number, memberData: {
    username?: string;
    email?: string;
    name?: string;
    mobile?: string;
    aadharNo?: string;
    password?: string;
    address?: string;
    dob?: string;
  }): Promise<MemberResponse> {
    const { data } = await this.api.put<MemberResponse>(`/members/${memberId}`, memberData);
    return data;
  }

  // GET /api/comittes/{id}/members
  async getByCommittee(comitteId: number): Promise<CommitteMemberMapResponse[]> {
    const { data } = await this.api.get<CommitteMemberMapResponse[]>(`/comittes/${comitteId}/members`);
    return data;
  }
}

export const memberService = new MemberService();
