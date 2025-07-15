export interface ProfessorInterface {
    professor: ProfessorData;
    courses: Course[];
    documents: Document[];
    students: Student[];
  }
  
  interface ProfessorData {
    professorId: string;
    professorName: string;
    professorEmail: string;
    professorCreatedDate?: Date;
    professorModifiedDate?: Date;
  }
  
  interface Course {
    courseId: string;
    courseName: string;
    courseDescription: string;
    courseSemester: number;
    courseCreatedDate?: Date;
    courseModifiedDate?: Date;
  }
  
  interface Document {
    courseId: string;
    documentId: string | null;
    documentTitle: string;
    documentDescription: string;
    documentLabels: string[];
    documentCreatedDate?: Date;
    documentModifiedDate?: Date;
    documentFirebaseUrl: string | null;
  }
  
  interface Student {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCreatedDate?: Date;
  }
  