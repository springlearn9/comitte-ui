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
}

export interface CommitteeListItem {
  id: string;
  name: string;
  owner: string;
  members: number;
  description: string;
  createdAt: string;
  budget: string;
  location?: string;
  avatar?: string;
}