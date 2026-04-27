export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface GymBranch {
  name: string;
  address: Address;
  contactNumber: string;
  openTime: string;
  closeTime: string;
}

export interface OnboardGymRequest {
  name: string;
  brandName?: string;
  description?: string;
  establishedDate?: string;
  registrationNumber?: string;
  email: string;
  phone: string;
  gstNumber?: string;
  websiteUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address: Address;
  branches: GymBranch[];
  assignedOwnerId?: string | null;
  planId?: string | null;
  isTrial: boolean;
}

export interface GymListResponse {
  id: string;
  gymName: string;
  brandName: string;
  ownerName: string;
  email: string;
  phone: string;
  branchesCount: number;
  isActive: boolean;
  isVerified: boolean;

  // Detail fields
  description?: string;
  websiteUrl?: string;
  gstNumber?: string;
  registrationNumber?: string;
  establishedDate?: string;
  logoUrl?: string;
  bannerUrl?: string;

  // Subscription info
  planName?: string;
  subscriptionExpiry?: string;
  isTrialPlan: boolean;
  paymentStatus: string;
  hasActiveSubscription: boolean;
}

export interface GymOwnerResponse {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  gymsOwned: number;
  invitationStatus: string;
  status: boolean;
}

export interface UpdateGymOwnerRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: boolean;
}

