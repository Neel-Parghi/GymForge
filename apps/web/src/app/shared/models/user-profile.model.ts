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
