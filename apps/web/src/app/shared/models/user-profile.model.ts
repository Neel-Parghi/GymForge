export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  role: string;
  gymId?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Onboarding
  isOnboarded?: boolean;
  currentOnboardingStep?: number;
}

export interface UpdateUserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  profilePictureUrl: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UploadAvatarResponseDto {
  url: string;
  message: string;
}

export interface StandaloneUserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  role: string;
  createdOn: Date;
  deletionRequestedOn?: Date;
  isEmailVerified: boolean;
}

export interface DeletionRequestDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  deletionRequestedOn: Date;
  scheduledDeletionTime: Date;
}

export interface UpdateUserPreferenceDto {
  primaryGoal?: string;
  targetWeight?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  targetTrainingTime?: number;
}