export default interface Notification {
    notificationId: number;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    objectId?: string;
    objectType: string;
    isDeleted: boolean;
    createdDate: Date;
}