export interface MyGymMembership {
  gymId: string;
  gymName: string;
  gymLogoUrl?: string | null;
  membershipNumber: string;
  status: string;
  joiningDate: string;
  currentSubscription?: {
    planNameSnapshot: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;
}
