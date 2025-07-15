export interface UserInterface {
  userId: string;
  name: string;
  email: string;
  pictureUrl: string;
  doubleFactorEnabled: boolean;
  passwordChanged: boolean;
  password?: string;
  roles: roles[];
  createdDate?: Date;
  modifiedDate?: Date;
}

interface roles {
  name: string;
}

export interface emailNotifications {
  courseName: string;
  studentEmail: string;
}
