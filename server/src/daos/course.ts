import { runStoredProcedure } from "../services/databaseService";
import { recordSetToJsonString } from "../utils/jsonParser";
import {
  CourseInterface,
  YearGroupedCourses,
} from "../interfaces/Courses/Course";
import { emailNotifications, UserInterface } from "../interfaces/Users/User";
/**
 * Class to handle the course data
 */
export default class CoursesDao {
  /**
   * Function to get all courses
   * @param pageNumber Actual page number
   * @param pageSize Page size
   * @param filter Filter by [name, email, phone, city, country]
   * @param orderBy Order by [name, email, phone, city, country]
   * @param orderDirection Order direction [ASC, DESC]
   * @param currentUserId Current user ID
   * @returns
   */
  public static async getAllCourses(
    pageNumber: number | undefined,
    pageSize: number | undefined,
    filter: string | undefined,
    orderBy: string | undefined,
    orderDirection: string | undefined,
    currentUserId: string
  ): Promise<{ courses: CourseInterface[]; totalPages: number }> {
    const result = await runStoredProcedure("SP_Courses_GetCourses", {
      IN_pageNumber: pageNumber,
      IN_pageSize: pageSize,
      IN_filter: filter,
      IN_orderBy: orderBy,
      IN_orderDirection: orderDirection,
      IN_currentUserId: currentUserId,
    });

    if (result.length === 0 || result[0].length === 0) {
      // Return an empty array if no courses are found
      return { courses: [], totalPages: 0 };
    }

    // Extract the course data from the result
    const coursesData = result[0]; // First array contains the course data
    const totalPages = result[1][0].totalPages; // Second array contains metadata

    // Parse the roles field and map to UserInterface
    const courses: CourseInterface[] = coursesData.map((course: any) => ({
      ...course,
    }));

    return { courses, totalPages };
  }

  /**
   * Function to create a new course in the database
   * @param name
   * @param description
   * @param semester
   * @param code
   * @param currentUserId
   * @returns userId
   */
  public static async createCourse(
    name: string,
    description: string,
    semester: number,
    currentUserId: string | undefined,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_CreateCourse", {
      IN_name: name,
      IN_description: description,
      IN_semester: semester,
      IN_currentUserId: currentUserId,
    });

    return result[0][0].courseCode;
  }

  /**
   * Function to get course by id
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getCourseById(
    courseId: string,
    currentUserId: string | undefined
  ): Promise<CourseInterface> {
    const result = await runStoredProcedure("SP_Courses_GetCourseById", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });
    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as CourseInterface;

    return parsedResult;
  }

  /**
   * Function to users join a course
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async JoinCourse(
    courseCode: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_JoinCourse", {
      IN_courseCode: courseCode,
      IN_currentUserId: currentUserId,
    });

    return result[0].length > 0;
  }

  /**
   * Function to users leave a course
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async LeaveCourse(
    courseId: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_LeaveCourse", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });

    return result[0].length > 0;
  }

  /**
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async RemoveStudent(
    courseId: string,
    currentUserId: string,
    studentId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_RemoveStudent", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
      IN_studentId: studentId,
    });

    return result[0].length > 0;
  }

  /**
   * Function to get the courses of the professor
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getCoursesProfessor(
    currentUserId: string | undefined
  ): Promise<{ data: YearGroupedCourses[] }> {
    const result = await runStoredProcedure("SP_Courses_GetCoursesProfessor", {
      IN_currentUserId: currentUserId,
    });

    if (result.length === 0 || result[0].length === 0) {
      return { data: [] };
    }

    const rawJson = result[0][0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];

    if (!rawJson) return { data: [] };

    const parsed: YearGroupedCourses[] = JSON.parse(rawJson);

    return { data: parsed };
  }

  /**
   * Function to get the courses of the student
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getCoursesStudent(
    currentUserId: string | undefined
  ): Promise<{ data: YearGroupedCourses[] }> {
    const result = await runStoredProcedure("SP_Courses_GetCoursesStudent", {
      IN_currentUserId: currentUserId,
    });

    if (result.length === 0 || result[0].length === 0) {
      return { data: [] };
    }

    const rawJson = result[0][0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];

    if (!rawJson) return { data: [] };

    const parsed: YearGroupedCourses[] = JSON.parse(rawJson);

    return { data: parsed };
  }

  /**
   *
   * @param currentUserId
   * @param courseId
   * @param studentId
   * @returns
   */
  public static async getStudentActivityCourse(
    currentUserId: string,
    courseId: string,
    studentId: string
  ) {
    const result = await runStoredProcedure("SP_Users_GetStudentActivity", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
      IN_studentId: studentId,
    });

    const [generalStatsRow, documentsStatsRow, activityTimelineRow] = result;

    const generalStats =
      JSON.parse(
        generalStatsRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
      ).generalStats[0] ?? {};

    const documentsStats =
      JSON.parse(
        documentsStatsRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
      ).documentsStats ?? [];

    const activityTimeline =
      JSON.parse(
        activityTimelineRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
      ).activityTimeline ?? [];

    return {
      generalStats,
      documentsStats,
      activityTimeline,
    };
  }

  /**
   * Function to update a new course in the database
   * @param name
   * @param description
   * @param semester
   * @param courseCode
   * @param currentUserId
   * @returns userId
   */
  public static async updateCourse(
    name: string,
    description: string,
    semester: number,
    currentUserId: string | undefined,
    courseId: string | undefined,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_UpdateCourse", {
      IN_name: name,
      IN_description: description,
      IN_semester: semester,
      IN_currentUserId: currentUserId,
      IN_courseId: courseId,
    });

    console.log(result);

    return result[0][0].userId;
  }

  /**
   * Function to delete a new course in the database
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async deleteCourse(
    courseId: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Courses_DeleteCourse", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });

    return result[0].length > 0;
  }

  /**
   * Function to get students by id
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudentByCourses(
    courseId: string | undefined,
    currentUserId: string | undefined
  ): Promise<UserInterface[]> {
    const result = await runStoredProcedure("SP_Users_GetStudentsByCourse", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as UserInterface[];

    return parsedResult;
  }

  /**
   * Function to get students by id
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudentByProfessor(
    currentUserId: string | undefined
  ): Promise<UserInterface> {
    const result = await runStoredProcedure("SP_Users_GetStudentsByProfessor", {
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as UserInterface;

    return parsedResult;
  }

    /**
   * Function to get students emails
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getCourseEmails(
    courseId: string | undefined,
    currentUserId: string | undefined
  ): Promise<emailNotifications[]> {
    const result = await runStoredProcedure("SP_Courses_GetCourseEmails", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as emailNotifications[];

    return parsedResult;
  }
}
