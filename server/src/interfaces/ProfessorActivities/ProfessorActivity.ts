export interface ProfessorActivityInterface {
  professorId: string;
  professorName: string;
  privateComments: number;
  publicComments: number;
  evaluations: number;
  courses: number;
  documentsUploaded: number;
  students: number;
  studentsPerCourse: StudentsPerCourse[];
}

export interface StudentsPerCourse {
  courseName: string;
  studentCount: number;
}