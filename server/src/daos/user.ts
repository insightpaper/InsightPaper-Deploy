import {
  runStoredProcedure,
  runTransaction,
} from "../services/databaseService";
import { UserInterface } from "../interfaces/Users/User";
import { ProfessorInterface } from "../interfaces/ProfessorDetails/Professor";
import { OtpInterface } from "../interfaces/OtpInterface";
import { recordSetToJsonString } from "../utils/jsonParser";
import { Table, NVarChar } from "mssql";
import {
  ProfessorActivityInterface,
  StudentsPerCourse,
} from "../interfaces/ProfessorActivities/ProfessorActivity";
import { StudentMetricInterface } from "../interfaces/StudentMetrics/StudentMetric";
/**
 * Class to handle the user data
 */
export default class UsersDao {
  /**
   * Function to get all users
   * @param pageNumber Actual page number
   * @param pageSize Page size
   * @param filter Filter by [name, email, phone, city, country]
   * @param orderBy Order by [name, email, phone, city, country]
   * @param orderDirection Order direction [ASC, DESC]
   * @param role Role filter [Admin, Creator, Brand]
   * @param currentUserId Current user ID
   * @returns
   */
  public static async getAllUsers(
    pageNumber: number | undefined,
    pageSize: number | undefined,
    filter: string | undefined,
    orderBy: string | undefined,
    orderDirection: string | undefined,
    roles: string[] | undefined,
    currentUserId: string
  ): Promise<{ users: UserInterface[]; totalPages: number }> {
    const rolesTable = new Table("StringListType");
    rolesTable.columns.add("value", NVarChar, { nullable: false });

    roles?.forEach((role) => {
      rolesTable.rows.add(role);
    });

    const result = await runStoredProcedure("SP_Users_GetUsers", {
      IN_pageNumber: pageNumber,
      IN_pageSize: pageSize,
      IN_filter: filter,
      IN_orderBy: orderBy,
      IN_orderDirection: orderDirection,
      IN_roles: rolesTable,
      IN_currentUserId: currentUserId,
    });

    if (result.length === 0 || result[0].length === 0) {
      // Return an empty array if no users are found
      return { users: [], totalPages: 0 };
    }

    // Extract the user data from the result
    const usersData = result[0]; // First array contains the user data
    const totalPages = result[1][0].totalPages; // Second array contains metadata

    // Parse the roles field and map to UserInterface
    const users: UserInterface[] = usersData.map((user: any) => ({
      ...user,
      doubleFactorEnabled: user.doubleFactorEnabled || false,
      passwordChanged: user.passwordChanged || false,
      roles: JSON.parse(user.roles),
    }));

    return { users, totalPages };
  }

  /**
   * Function to get a user by email
   * @param email
   * @returns The user object
   */
  public static async getUserByEmail(email: string): Promise<UserInterface> {
    const result = await runStoredProcedure("SP_Users_GetUserByEmail", {
      IN_email: email,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as UserInterface;

    return parsedResult;
  }

  /**
   * Function to get a user by ID
   * @param userId
   * @param currentUserId
   * @returns
   */
  public static async getUserById(
    userId: string,
    currentUserId: string
  ): Promise<UserInterface> {
    const result = await runStoredProcedure("SP_Users_GetUserById", {
      IN_userId: userId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as UserInterface;

    return parsedResult;
  }

  /**
   * Gets the user otp by email
   * @param email
   * @returns The users object
   */
  public static async getUserOtpByEmail(email: string): Promise<OtpInterface> {
    const result = await runStoredProcedure("SP_Users_GetUserOtpByEmail", {
      IN_email: email,
    });

    return result[0][0] as OtpInterface;
  }

  /**
   * Function update the user otp by email
   * @param email
   * @param securityCode
   * @param securityCodeExpiration
   * @returns The user object
   */
  public static async updateUserOtpByEmail(
    email: string,
    securityCode: string,
    securityCodeExpiration: Date
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Users_UpdateUserOtpByEmail", {
      IN_email: email,
      IN_securityCode: securityCode,
      IN_securityCodeExpiration: securityCodeExpiration,
    });
    return result[0].length > 0;
  }

  /**
   * Function to invalidate the user otp by email
   * @param email
   * @returns Boolean
   */
  public static async invalidateUserOtpByEmail(
    email: string
  ): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Users_InvalidateUserOtpByEmail",
      {
        IN_email: email,
      }
    );

    return result[0].length > 0;
  }

  /**
   * Update the user password
   * @param email
   * @param newPassword
   * @param currentUserId
   * @returns Boolean
   */
  public static async updateUserPassword(
    userId: string,
    newPassword: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_UpdateUserPassword",
        params: {
          IN_userId: userId,
          IN_password: newPassword,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0][0].IN_affectedEntity !== null;
  }

  /**
   * Function to create a new user in the database
   * @param name
   * @param email
   * @param password
   * @param currentUserId
   * @returns userId
   */
  public static async createAdminUser(
    name: string,
    email: string,
    password: string,
    currentUserId: string | undefined,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_CreateAdminUser",
        params: {
          IN_name: name,
          IN_email: email,
          IN_password: password,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to create a new professor in the database
   * @param name
   * @param email
   * @param password
   * @param currentUserId
   * @returns userId
   */
  public static async createProfessorUser(
    name: string,
    email: string,
    password: string,
    currentUserId: string | undefined,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_CreateProfessorUser",
        params: {
          IN_name: name,
          IN_email: email,
          IN_password: password,
          IN_currentUserId: currentUserId,
          IN_securityCode: null,
          IN_securityCodeExpiration: null,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0][0].userId;
  }

  /**
   * Function to create a student user
   * @param userData User basic data
   * @returns String with the new user ID
   */
  public static async createStudentUser(
    userData: UserInterface
  ): Promise<string> {
    const result = await runTransaction([
      {
        name: "SP_Users_CreateUser",
        params: {
          IN_name: userData.name,
          IN_email: userData.email,
          IN_password: userData.password,
          IN_securityCode: null,
          IN_securityCodeExpiration: null,
        },
      },
    ]);

    return result[0][0].userId;
  }

  /**
   * Function to update the user details
   * @param user User object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async updateUser(
    user: UserInterface,
    linkToPortfolio: string | undefined,
    creatorTypes: { name: string }[] | undefined,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const typesTable = new Table("StringListType");

    typesTable.columns.add("value", NVarChar, { nullable: false });

    creatorTypes?.forEach((type) => {
      typesTable.rows.add(type.name);
    });

    const result = await runTransaction([
      {
        name: "SP_Users_UpdateUser",
        params: {
          IN_userId: user.userId,
          IN_name: user.name,
          IN_email: user.email,
          IN_password: user.password,
          IN_pictureUrl: user.pictureUrl,
          //IN_linkToPortfolio: linkToPortfolio,
          //IN_creatorTypes: typesTable,
          IN_securityCode: null,
          IN_securityCodeExpiration: null,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to delete a user
   * @param userId
   * @param currentUserId
   * @returns Boolean
   */
  public static async deleteUser(
    userId: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_DeleteUser",
        params: {
          IN_userId: userId,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Gets the user otp secret by email
   * @param email
   * @returns
   */
  public static async getUserOtpSecretByEmail(email: string): Promise<string> {
    const result = await runStoredProcedure(
      "SP_Users_GetUserOtpSecretByEmail",
      {
        IN_email: email,
      }
    );

    return result[0][0].otpSecret as string;
  }

  /**
   * Updates the user otp secret by email
   * @param userId
   * @param otpSecret
   * @param currentUserId
   * @param ipAddress
   * @param userAgent
   * @returns
   */
  public static async updateUserOtpSecret(
    userId: string,
    otpSecret: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_UpdateUserOtpSecret",
        params: {
          IN_userId: userId,
          IN_otpSecret: otpSecret,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to disable the otp authentication app
   * @param userId
   * @param currentUserId
   * @param ipAddress
   * @param userAgent
   * @returns
   */
  public static async disableOtpAuthApp(
    userId: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_DisableUserOtpSecret",
        params: {
          IN_userId: userId,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to enable the otp authentication app
   * @param userId
   * @param currentUserId
   * @param ipAddress
   * @param userAgent
   * @returns
   */
  public static async enableOtpAuthApp(
    userId: string,
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_EnableUserOtpSecret",
        params: {
          IN_userId: userId,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "Users",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    return result[0].length > 0;
  }


  public static async updateUserRoles(
    userId: string,
    roles: string[],
    currentUserId: string,
    ipAddress: string | undefined,
    userAgent: string | undefined
  ): Promise<boolean> {
    const rolesTable = new Table("StringListType");

    rolesTable.columns.add("value", NVarChar, { nullable: false });

    roles.forEach((role) => {
      rolesTable.rows.add(role);
    });

    const result = await runTransaction([
      {
        name: "SP_UserRoles_UpdateUserRoles",
        params: {
          IN_userId: userId,
          IN_roles: rolesTable,
          IN_currentUserId: currentUserId,
        },
      },
      {
        name: "SP_SystemLog_CreateLog",
        params: {
          IN_userId: currentUserId,
          IN_affectedEntity: "UserRoles",
          IN_ipAddress: ipAddress,
          IN_userAgent: userAgent,
        },
      },
    ]);

    console.log(result);

    return result[0].length > 0;
  }

  /**
   * Function to delete a user
   * @param userId
   * @param currentUserId
   * @returns Boolean
   */
  public static async deleteProfessor(
    professorId: string,
    currentUserId: string
  ): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_DeleteProfessor",
        params: {
          IN_professorId: professorId,
          IN_currentUserId: currentUserId,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to get all the students
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudents(
    currentUserId: string | undefined
  ): Promise<UserInterface> {
    const result = await runStoredProcedure("SP_Users_GetStudents", {
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as UserInterface;

    return parsedResult;
  }

  /**
   * Function to delete a user
   * @param userId
   * @param currentUserId
   * @returns Boolean
   */
  public static async deleteAccount(currentUserId: string): Promise<boolean> {
    const result = await runTransaction([
      {
        name: "SP_Users_DeleteUserAccount",
        params: {
          IN_currentUserId: currentUserId,
        },
      },
    ]);

    return result[0].length > 0;
  }

  /**
   * Function to get the professor details
   * @param currentUserId Current user ID
   * @param userId Professor id
   * @returns ProfessorInterface
   */
  public static async getProfessorDetails(
    userId: string | undefined,
    currentUserId: string | undefined
  ): Promise<ProfessorInterface> {
    const result = await runStoredProcedure("SP_Users_GetProfessorDetails", {
      IN_currentUserId: currentUserId,
      IN_professorId: userId,
    });

    const jsonString = recordSetToJsonString(result);
    const parsedRaw = JSON.parse(jsonString)[0];

    const professorData = JSON.parse(parsedRaw.professorData || "[]");
    const courses = JSON.parse(parsedRaw.courses || "[]");
    const documents = JSON.parse(parsedRaw.documents || "[]");
    const students = JSON.parse(parsedRaw.students || "[]");

    const parsedResult = professorData[0] || {};

    parsedResult.courses = courses;
    parsedResult.documents = documents;
    parsedResult.students = students;

    return parsedResult as ProfessorInterface;
  }

  /**
   * Function to create a recommendation
   * @param documentId Course object with the new data
   * @param courseId Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async createRecommendation(
    documentId: string | undefined,
    courseId: string | undefined,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Users_CreateRecommendation", {
      IN_currentUserId: currentUserId,
      IN_courseId: courseId,
      IN_documentId: documentId,
    });
    return result[0][0].lastNotificationId;
  }

  /**
   * Function to get the professor activities
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getProfesorsActivity(
    currentUserId: string | undefined,
    professorId: string | undefined
  ): Promise<ProfessorActivityInterface> {
    const result = await runStoredProcedure("SP_Users_GetProfesorsActivity", {
      IN_currentUserId: currentUserId,
      IN_professorId: professorId,
    });
    // Acceder al string dentro de la propiedad especial
    const rawJson =
      result?.[0]?.[0]?.["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];

    if (!rawJson) {
      throw new Error("No se encontró JSON en el resultado del procedimiento");
    }

    const parsedRaw = JSON.parse(rawJson)[0] as Omit<
      ProfessorActivityInterface,
      "studentsPerCourse"
    > & {
      "studentsPerCourse (JSON)": string | StudentsPerCourse[];
    };

    const studentsPerCourse =
      typeof parsedRaw["studentsPerCourse (JSON)"] === "string"
        ? JSON.parse(parsedRaw["studentsPerCourse (JSON)"])
        : parsedRaw["studentsPerCourse (JSON)"];

    const parsedResult: ProfessorActivityInterface = {
      ...parsedRaw,
      studentsPerCourse,
    };

    return parsedResult;
  }

  /**
   * Function to get the student metrics
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudentsMetrics(
    currentUserId: string | undefined,
    courseId: string | undefined
  ): Promise<StudentMetricInterface> {
    const result = await runStoredProcedure("SP_Users_GetStudentsMetrics", {
      IN_currentUserId: currentUserId,
      IN_courseId: courseId,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as StudentMetricInterface;

    return parsedResult;
  }

  /**
   * Function to get the course notifications
   * @param courseId course ID
   * @param currentUserId Current user ID
   */
  /*
  public static async selectCourseNotifications(
    courseId: string,
    currentUserId: string
  ): Promise<NotificationInterface[]> {
    const result = await runStoredProcedure("SP_Users_SelectCourseNotifications", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
    });

    console.log(result);

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as NotificationInterface[];

    return parsedResult;
  }*/
}
