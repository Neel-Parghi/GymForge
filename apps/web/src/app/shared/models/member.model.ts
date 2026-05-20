import { Gender, MemberStatus, PaymentStatus } from '../enums/member-enums';

export interface GymMember {
  id: string;
  gymId: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  profilePictureUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  address?: Address;
  medicalConditions?: string;
  fitnessGoals?: string[];
  joiningDate: string;
  status: MemberStatus;
  currentSubscription?: MemberSubscription;
  branchId?: string;
  // computed client-side for grid badge rendering
  statusLabel?: string;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  gymPlanId: string;
  planNameSnapshot: string;
  pricePaid: number;
  durationMonths: number;
  extendedMonths: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentStatus: PaymentStatus;
  paymentStatusLabel?: string;
}

export interface OnboardMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  address?: Address;
  medicalConditions?: string;
  fitnessGoals?: string[];
  gymPlanId: string;
  startDate?: string;
  paymentStatus?: PaymentStatus;
  branchId?: string;
}

export interface RenewSubscriptionRequest {
  gymPlanId: string;
  startDate?: string;
  paymentStatus?: PaymentStatus;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export { MemberStatus };
