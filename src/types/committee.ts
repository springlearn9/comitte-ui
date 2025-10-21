export interface Committee {
  id?: string;
  name: string;
  description: string;
  totalAmount: string;
  monthlyAmount: string;
  duration: string;
  startDate: string;
  location: string;
  maxMembers: number;
  category: string;
  rules?: string;
  owner?: string;
  members?: number;
  createdAt?: string;
  budget?: string;
  avatar?: string;
  paymentDateDays?: string; // for backend mapping
}

export interface CommitteeListItem {
  id: string;
  name: string;
  owner: string;
  members: number;
  description: string;
  createdAt: string;
  budget: string;
  monthlyShare?: number;
  bidsCount?: number;
  bidsRatio?: string;
  location?: string;
  avatar?: string;
}

// Backend DTOs (Spring Boot)
export interface ComitteRequestDTO {
  ownerId: number;            // required
  comitteName: string;        // required
  startDate?: string;         // ISO date (LocalDate)
  fullAmount?: number;
  membersCount?: number;
  fullShare?: number;
  dueDateDays?: number;
  paymentDateDays?: number;
}

export interface ComitteResponseDTO {
  comitteId: number;
  ownerId: number;
  ownerName?: string;
  comitteName: string;
  calculatedComitteName?: string;
  startDate?: string; // ISO date
  fullAmount?: number;
  membersCount?: number;
  fullShare?: number;
  dueDateDays?: number;
  paymentDateDays?: number;
  bidsCount?: number;
  bidsRatio?: string | number;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

// Mappers between UI model and backend DTOs
export const mapResponseToListItem = (r: ComitteResponseDTO): CommitteeListItem => ({
  id: String(r.comitteId),
  name: r.calculatedComitteName ?? r.comitteName,
  owner: (r.ownerName && r.ownerName.trim().length > 0) ? r.ownerName : String(r.ownerId),
  members: r.membersCount ?? 0,
  description: '',
  createdAt: r.startDate ?? '',
  budget: r.fullAmount != null ? `₹${r.fullAmount}` : '₹0',
  monthlyShare: r.fullShare ?? undefined,
  bidsCount: r.bidsCount ?? undefined,
  bidsRatio: r.bidsRatio != null ? String(r.bidsRatio) : undefined,
  location: undefined,
});

export const mapModalToRequest = (c: Committee, ownerId: number): ComitteRequestDTO => ({
  ownerId,
  comitteName: c.name,
  startDate: c.startDate || undefined,
  fullAmount: c.totalAmount ? Number(c.totalAmount) : undefined,
  membersCount: c.maxMembers || undefined,
  fullShare: c.monthlyAmount ? Number(c.monthlyAmount) : undefined,
  dueDateDays: c.duration ? Number(c.duration) : undefined,
  paymentDateDays: c.paymentDateDays ? Number(c.paymentDateDays) : undefined,
});