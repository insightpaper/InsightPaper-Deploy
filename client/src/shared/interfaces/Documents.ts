export interface DocumentItem {
    documentId: string;
    title: string;
    description: string;
    size: string;
    firebaseUrl: string;
    labels?: string[];
  }