export interface SaaSPlanDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  maxBranches?: number;
  maxMembers?: number;
  createedAt: Date; // Keep exact spelling from backend (CreateedAt)
  isActive: boolean;
  isTrial: boolean;
}

export interface CreateSaaSPlanDto {
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  maxBranches?: number;
  maxMembers?: number;
  isActive: boolean;
  isTrial: boolean;
}

export interface UpdateSaaSPlanDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  maxBranches?: number;
  maxMembers?: number;
  isActive: boolean;
  isTrial: boolean;
}
