export interface CourseInterface {
  courseId: string;          
  professorId: string;     
  name: string;           
  description: string;       
  semester: number;          
  createdDate: Date;         
  modifiedDate: Date;        
  idDeleted?: boolean | null; 
  code: string;              
}


export interface YearGroupedCourses {
  year: number;
  courses: CourseInterface[];
}