export interface IntProfessorDetails {
  courses?: [
    {
      courseId: string;
      courseName: string;
      courseSemester: string;
      courseDescription: string;
      courseCreatedDate: string;
      courseModifiedDate: string;
    },
  ];
  documents?: [
    {
      documentId: string;
      documentName: string;
      documentTitle: string;
      documentFirebaseUrl: string;
      documentLabels: string;
    },
  ];
  students?: [
    {
      studentId: string;
      studentName: string;
      studentEmail: string;
    },
  ];
  professorEmail: string;
  professorName: string;
  professorId: string;
}


export interface CourseStudentCount {
  courseName: string;
  studentCount: number;
}

export interface ProfessorStats {
  professorId: string;
  professorName: string;
  privateComments: number;
  publicComments: number;
  evaluations: number;
  courses: number;
  documentsUploaded: number;
  students: number;
  studentsPerCourse: CourseStudentCount[];
}
