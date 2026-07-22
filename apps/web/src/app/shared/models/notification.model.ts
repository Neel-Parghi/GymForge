export interface UserNotificationResponse {
  id: string;
  gymId: string;
  branchId?: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdOn: Date;
}
