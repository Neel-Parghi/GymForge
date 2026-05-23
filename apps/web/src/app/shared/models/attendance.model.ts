import { MemberStatus } from './member.model';

export interface SearchableMember {
  id: string;
  name: string;
  membershipNumber: string;
  email: string;
  status: MemberStatus;
  statusLabel: string;
  planName: string;
  expiryDate: string;
  initials: string;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface AttendanceLogResponse {
  id: string;
  memberId: string;
  memberName: string;
  membershipNumber: string;
  initials: string;
  planName: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: string;
  status: string;
  branchName: string;
}

export interface CheckedInMemberResponse {
  logId: string;
  memberId: string;
  name: string;
  membershipNumber: string;
  initials: string;
  planName: string;
  checkInTime: string;
}

export interface OccupancyStatsResponse {
  currentHeadcount: number;
  safetyLimit: number;
  utilizationPercentage: number;
}

export interface CheckInRequest {
  memberId: string;
  method: string;
}

export interface CheckOutRequest {
  memberId: string;
}
