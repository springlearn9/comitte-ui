import axios from 'axios';
import { authService } from './authService';
import { sessionRefresh } from '../utils/sessionRefresh';
import type {
  ProjectResponse,
  ProjectRequest,
  MaterialResponse,
  MaterialRequest,
  LabourDetailsResponse,
  LabourDetailsRequest,
  PaymentDetailsResponse,
  PaymentDetailsRequest,
  TypesResponse,
  TypesRequest,
} from '../types/construction';

class ConstructionService {
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

  // ============ PROJECT ENDPOINTS ============
  async createProject(data: ProjectRequest): Promise<ProjectResponse> {
    const { data: response } = await this.api.post<ProjectResponse>('/projects', data);
    return response;
  }

  async getProject(projectId: number): Promise<ProjectResponse> {
    const { data } = await this.api.get<ProjectResponse>(`/projects/${projectId}`);
    return data;
  }

  async getAllProjects(): Promise<ProjectResponse[]> {
    const { data } = await this.api.get<ProjectResponse[]>('/projects');
    return data;
  }

  async updateProject(projectId: number, data: ProjectRequest): Promise<ProjectResponse> {
    const { data: response } = await this.api.put<ProjectResponse>(`/projects/${projectId}`, data);
    return response;
  }

  async deleteProject(projectId: number): Promise<void> {
    await this.api.delete(`/projects/${projectId}`);
  }

  // ============ MATERIAL ENDPOINTS ============
  async createMaterial(data: MaterialRequest): Promise<MaterialResponse> {
    const { data: response } = await this.api.post<MaterialResponse>('/materials', data);
    return response;
  }

  async getMaterial(materialId: number): Promise<MaterialResponse> {
    const { data } = await this.api.get<MaterialResponse>(`/materials/${materialId}`);
    return data;
  }

  async getAllMaterials(): Promise<MaterialResponse[]> {
    const { data } = await this.api.get<MaterialResponse[]>('/materials');
    return data;
  }

  async getMaterialsByProject(projectId: number): Promise<MaterialResponse[]> {
    const { data } = await this.api.get<MaterialResponse[]>(`/materials/project/${projectId}`);
    return data;
  }

  async updateMaterial(materialId: number, data: MaterialRequest): Promise<MaterialResponse> {
    const { data: response } = await this.api.put<MaterialResponse>(`/materials/${materialId}`, data);
    return response;
  }

  async deleteMaterial(materialId: number): Promise<void> {
    await this.api.delete(`/materials/${materialId}`);
  }

  // ============ LABOUR DETAILS ENDPOINTS ============
  async createLabourDetails(data: LabourDetailsRequest): Promise<LabourDetailsResponse> {
    const { data: response } = await this.api.post<LabourDetailsResponse>('/labour-details', data);
    return response;
  }

  async getLabourDetails(id: number): Promise<LabourDetailsResponse> {
    const { data } = await this.api.get<LabourDetailsResponse>(`/labour-details/${id}`);
    return data;
  }

  async getAllLabourDetails(): Promise<LabourDetailsResponse[]> {
    const { data } = await this.api.get<LabourDetailsResponse[]>('/labour-details');
    return data;
  }

  async getLabourDetailsByProject(projectId: number): Promise<LabourDetailsResponse[]> {
    const { data } = await this.api.get<LabourDetailsResponse[]>(`/labour-details/project/${projectId}`);
    return data;
  }

  async updateLabourDetails(id: number, data: LabourDetailsRequest): Promise<LabourDetailsResponse> {
    const { data: response } = await this.api.put<LabourDetailsResponse>(`/labour-details/${id}`, data);
    return response;
  }

  async deleteLabourDetails(id: number): Promise<void> {
    await this.api.delete(`/labour-details/${id}`);
  }

  // ============ PAYMENT DETAILS ENDPOINTS ============
  async createPaymentDetails(data: PaymentDetailsRequest): Promise<PaymentDetailsResponse> {
    const { data: response } = await this.api.post<PaymentDetailsResponse>('/payment-details', data);
    return response;
  }

  async getPaymentDetails(paymentId: number): Promise<PaymentDetailsResponse> {
    const { data } = await this.api.get<PaymentDetailsResponse>(`/payment-details/${paymentId}`);
    return data;
  }

  async getAllPaymentDetails(): Promise<PaymentDetailsResponse[]> {
    const { data } = await this.api.get<PaymentDetailsResponse[]>('/payment-details');
    return data;
  }

  async getPaymentDetailsByProject(projectId: number): Promise<PaymentDetailsResponse[]> {
    const { data } = await this.api.get<PaymentDetailsResponse[]>(`/payment-details/project/${projectId}`);
    return data;
  }

  async updatePaymentDetails(paymentId: number, data: PaymentDetailsRequest): Promise<PaymentDetailsResponse> {
    const { data: response } = await this.api.put<PaymentDetailsResponse>(`/payment-details/${paymentId}`, data);
    return response;
  }

  async deletePaymentDetails(paymentId: number): Promise<void> {
    await this.api.delete(`/payment-details/${paymentId}`);
  }

  // ============ TYPES ENDPOINTS ============
  async createType(data: TypesRequest): Promise<TypesResponse> {
    const { data: response } = await this.api.post<TypesResponse>('/types', data);
    return response;
  }

  async getType(id: number): Promise<TypesResponse> {
    const { data } = await this.api.get<TypesResponse>(`/types/${id}`);
    return data;
  }

  async getAllTypes(): Promise<TypesResponse[]> {
    const { data } = await this.api.get<TypesResponse[]>('/types');
    return data;
  }

  async getTypesByModule(moduleName: string): Promise<TypesResponse[]> {
    const { data } = await this.api.get<TypesResponse[]>(`/types/module/${moduleName}`);
    return data;
  }

  async getTypesByModuleAndCategory(moduleName: string, category: string): Promise<TypesResponse[]> {
    const { data } = await this.api.get<TypesResponse[]>(`/types/module/${moduleName}/category/${category}`);
    return data;
  }

  async updateType(id: number, data: TypesRequest): Promise<TypesResponse> {
    const { data: response } = await this.api.put<TypesResponse>(`/types/${id}`, data);
    return response;
  }

  async deleteType(id: number): Promise<void> {
    await this.api.delete(`/types/${id}`);
  }
}

export const constructionService = new ConstructionService();
