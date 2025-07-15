export interface Notification {
  objectId?: string;
  userId: string;
  notificationId: string;
  title: string;
  message: string;
  objectType: "ProjectCreators" | "Projects";
  isRead?: boolean;
  createdDate: string;
}
