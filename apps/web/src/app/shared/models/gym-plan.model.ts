export interface GymPlan {
    id: string;
    gymOwnerId: string;
    name: string;
    description?: string;
    price: number;
    durationMonths: number;
    maxBranches?: number;
    features?: string[];
    isActive: boolean;
    isOffer: boolean;
    discountedPrice?: number;
    extendedMonths?: number;
    createdOn: Date;
    createdBy: string;
    modifiedOn?: Date;
    modifiedBy?: string;
}

export interface CreateGymPlanRequest {
    gymOwnerId: string;
    name: string;
    description?: string;
    price: number;
    durationMonths: number;
    maxBranches?: number;
    features?: string[];
    isActive: boolean;
    isOffer: boolean;
    discountedPrice?: number;
    extendedMonths?: number;
}

export interface UpdateGymPlanRequest {
    id: string;
    gymOwnerId: string;
    name: string;
    description?: string;
    price: number;
    durationMonths: number;
    maxBranches?: number;
    features?: string[];
    isActive: boolean;
    isOffer: boolean;
    discountedPrice?: number;
    extendedMonths?: number;
}
