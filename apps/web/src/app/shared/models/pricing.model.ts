export interface PricingPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationInDays: number;
    maxBranches?: number;
    maxMembers?: number;
    isTrial: boolean;
    isActive: boolean;
    createdAt?: string;
}
export interface PricingPlanCreateRequest {
    name: string;
    description: string;
    price: number | null;
    durationInDays: number | null;
    maxBranches: number | null;
    maxMembers: number | null;
    isTrial: boolean;
    isActive: boolean;
}