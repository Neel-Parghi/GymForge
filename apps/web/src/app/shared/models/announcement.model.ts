export interface AnnouncementTemplateRequest {
  name: string;
  type: number; // 0 = Custom, 1 = Inactivity, 2 = ExpiredMembership
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
}

export interface AnnouncementTemplateResponse {
  id: string;
  gymId: string;
  branchId?: string;
  name: string;
  type: number;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
  createdOn: Date;
}

export interface GymAnnouncementRequest {
  title: string;
  message: string;
  isActive: boolean;
  validUntil?: Date;
}

export interface GymAnnouncementResponse {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  validUntil?: Date;
  createdOn: Date;
}
