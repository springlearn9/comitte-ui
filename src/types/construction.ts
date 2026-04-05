// Project Types
export interface ProjectResponse {
  projectId: number;
  name: string;
  details?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface ProjectRequest {
  name: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Material Types
export interface MaterialResponse {
  materialId: number;
  projectId: number;
  projectName?: string;
  materialDate: string;
  details?: string;
  material?: string;
  materialType?: string;
  labour?: string;
  labourType?: string;
  supplier?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  amount?: number;
  bhada?: number;
  totalAmount?: number;
  tags?: string;
  paymentStatus?: string;
  paidDate?: string;
  paymentId?: number;
  paymentDetails?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface MaterialRequest {
  projectId: number;
  materialDate: string;
  details?: string;
  material?: string;
  materialType?: string;
  labour?: string;
  labourType?: string;
  supplier?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  amount?: number;
  bhada?: number;
  totalAmount?: number;
  tags?: string;
  paymentStatus?: string;
  paidDate?: string;
  paymentId?: number;
  paymentDetails?: string;
}

export interface Material {
  id: string;
  projectId: number;
  projectName?: string;
  materialDate: string;
  details?: string;
  material?: string;
  materialType?: string;
  labour?: string;
  labourType?: string;
  supplier?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  amount?: number;
  bhada?: number;
  totalAmount?: number;
  tags?: string;
  paymentStatus?: string;
  paidDate?: string;
  paymentId?: number;
  paymentDetails?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Labour Details Types
export interface LabourDetailsResponse {
  id: number;
  projectId: number;
  projectName?: string;
  labourDate: string;
  labourType?: string;
  labourAmount?: number;
  details?: string;
  tags?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface LabourDetailsRequest {
  projectId: number;
  labourDate: string;
  labourType?: string;
  labourAmount?: number;
  details?: string;
  tags?: string;
}

export interface LabourDetails {
  id: string;
  projectId: number;
  projectName?: string;
  labourDate: string;
  labourType?: string;
  labourAmount?: number;
  details?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payment Details Types
export interface PaymentDetailsResponse {
  paymentId: number;
  projectId: number;
  projectName?: string;
  paymentDate: string;
  details?: string;
  paymentType?: string;
  receiverDetails?: string;
  tags?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface PaymentDetailsRequest {
  projectId: number;
  paymentDate: string;
  details?: string;
  paymentType?: string;
  receiverDetails?: string;
  tags?: string;
}

export interface PaymentDetails {
  id: string;
  projectId: number;
  projectName?: string;
  paymentDate: string;
  details?: string;
  paymentType?: string;
  receiverDetails?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types Management
export interface TypesResponse {
  id: number;
  moduleName: string;
  category?: string;
  typeName: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export interface TypesRequest {
  moduleName: string;
  category?: string;
  typeName: string;
}

export interface TypeItem {
  id: string;
  moduleName: string;
  category?: string;
  typeName: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mapper functions
export const mapProjectResponse = (r: ProjectResponse): Project => ({
  id: String(r.projectId),
  name: r.name,
  details: r.details,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
});

export const mapMaterialResponse = (r: MaterialResponse): Material => ({
  id: String(r.materialId),
  projectId: r.projectId,
  projectName: r.projectName,
  materialDate: r.materialDate,
  details: r.details,
  material: r.material,
  materialType: r.materialType,
  labour: r.labour,
  labourType: r.labourType,
  supplier: r.supplier,
  quantity: r.quantity,
  unit: r.unit,
  pricePerUnit: r.pricePerUnit,
  amount: r.amount,
  bhada: r.bhada,
  totalAmount: r.totalAmount,
  tags: r.tags,
  paymentStatus: r.paymentStatus,
  paidDate: r.paidDate,
  paymentId: r.paymentId,
  paymentDetails: r.paymentDetails,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
});

export const mapLabourDetailsResponse = (r: LabourDetailsResponse): LabourDetails => ({
  id: String(r.id),
  projectId: r.projectId,
  projectName: r.projectName,
  labourDate: r.labourDate,
  labourType: r.labourType,
  labourAmount: r.labourAmount,
  details: r.details,
  tags: r.tags,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
});

export const mapPaymentDetailsResponse = (r: PaymentDetailsResponse): PaymentDetails => ({
  id: String(r.paymentId),
  projectId: r.projectId,
  projectName: r.projectName,
  paymentDate: r.paymentDate,
  details: r.details,
  paymentType: r.paymentType,
  receiverDetails: r.receiverDetails,
  tags: r.tags,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
});

export const mapTypesResponse = (r: TypesResponse): TypeItem => ({
  id: String(r.id),
  moduleName: r.moduleName,
  category: r.category,
  typeName: r.typeName,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
});
