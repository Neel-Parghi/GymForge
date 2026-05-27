export interface StaffResponse {
  id: string;
  staffNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string; // Virtual field for UI
  email: string;
  phoneNumber: string;
  role: number;
  roleName?: string;
  profilePictureUrl?: string;
  specializations?: string[];
  bio?: string;
  experienceYears?: number;
  instagramUrl?: string;
  portfolioUrl?: string;
  shiftTimings?: string;
  isActive: boolean;
  joiningDate: string;
  branchId?: string;
  isCheckedIn?: boolean;
  lastCheckInTime?: string;
}

export interface AddStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: number;
  specializations?: string[];
  bio?: string;
  experienceYears?: number;
  instagramUrl?: string;
  portfolioUrl?: string;
  shiftTimings?: string;
  branchId?: string;
}

export interface MeasurementResponse {
  id: string;
  weight?: number;
  height?: number;
  bodyFatPercentage?: number;
  bmi?: number;
  notes?: string;
  date: string;
  recordedBy?: string;
}

export interface AddMeasurementRequest {
  weight?: number;
  height?: number;
  bodyFatPercentage?: number;
  bmi?: number;
  notes?: string;
}

export interface StaffAttendanceLogResponse {
  id: string;
  staffId: string;
  staffName: string;
  staffNumber: string;
  roleName: string;
  checkInTime: string;
  checkOutTime?: string;
  notes?: string;
  hoursWorked?: number;
}
