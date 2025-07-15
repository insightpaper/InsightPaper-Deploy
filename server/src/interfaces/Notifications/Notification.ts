export interface NotificationInterface {
  notificationId: string;          
  title: string;     
  message: string;           
  isRead: boolean;       
  objectId: string;
  objectType: string;
  createdDate: Date;
}
