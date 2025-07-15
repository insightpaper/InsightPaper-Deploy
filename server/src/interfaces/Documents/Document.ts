export interface DocumentInterface {
    documentId: string | null;
    title: string;
    description: string;
    labels: string[]; 
    studentId: string | null;
    createdDate: Date;
    modifiedDate: Date;
    firebaseUrl: string | null;
  }