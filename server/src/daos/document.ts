import { runStoredProcedure } from "../services/databaseService";
import { recordSetToJsonString } from "../utils/jsonParser";
import { DocumentInterface } from "../interfaces/Documents/Document";
/**
 * Class to handle the course data
 */
export default class CoursesDao {
  /**
   * Function to get documents
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getDocuments(
    courseId: string | undefined,
    currentUserId: string | undefined,
    pageNumber: number | null = 1,
    pageSize: number | null = 10,
    orderBy: string = "createdDate",
    orderDirection: "ASC" | "DESC" = "ASC"
  ): Promise<{ documents: DocumentInterface[]; totalCount: number }> {
    const result = await runStoredProcedure("SP_Documents_GetDocuments", {
      IN_courseId: courseId,
      IN_currentUserId: currentUserId,
      IN_pageNumber: pageNumber,
      IN_pageSize: pageSize,
      IN_orderBy: orderBy,
      IN_orderDirection: orderDirection,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return { documents: [], totalCount: 0 };
    }

    const parsedResult = JSON.parse(jsonString);
    return parsedResult;
  }

  /**
   * Function to delete a new document in the database
   * @param document document object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async deleteDocument(
    documentId: string,
    currentUserId: string
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Documents_DeleteDocument", {
      IN_documentId: documentId,
      IN_currentUserId: currentUserId,
    });

    return result[0].length > 0;
  }

  /**
   * Function to get the history
   * @param documentId Document object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getHistory(
    documentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<DocumentInterface> {
    const result = await runStoredProcedure("SP_Documents_GetHistory", {
      IN_documentId: documentId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    const parsedResult = JSON.parse(jsonString) as DocumentInterface;

    return parsedResult;
  }

  /**
   * Function to update a document
   * @param documentId Document object with the new data
   * @param title Document title
   * @param description Document description
   * @param labels Document labels
   * @param firebaseUrl Firebase url to the document
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async updateDocument(
    documentId: string | undefined,
    title: string,
    description: string,
    labels: string,
    firebaseUrl: string,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Documents_UpdateDocument", {
      IN_documentId: documentId,
      IN_title: title,
      IN_description: description,
      IN_labels: labels,
      IN_currentUserId: currentUserId,
    });

    // Recuerden que no siempre viene el resultado
    if (!result || result.length === 0) {
      return false;
    }

    return result[0].length > 0;
  }

  /**
   * Function to create a document
   * @param courseId Course object with the new data
   * @param title Document title
   * @param description Document description
   * @param labels Document labels
   * @param firebaseUrl Firebase url to the document
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async createDocument(
    title: string,
    description: string,
    labels: string,
    firebaseUrl: string,
    courseId: string | undefined,
    currentUserId: string | undefined
  ): Promise<string | undefined> {
    const result = await runStoredProcedure("SP_Documents_CreateDocument", {
      IN_title: title,
      IN_description: description,
      IN_labels: labels,
      IN_firebaseUrl: firebaseUrl,
      IN_currentUserId: currentUserId,
      IN_courseId: courseId,
    });
    return result[0][0].affectedEntityId;
  }

  /**
   * Function to get documents
   * @param documentId documentId object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getDocumentById(
    documentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<DocumentInterface[]> {
    const result = await runStoredProcedure("SP_Documents_GetDocumentById", {
      IN_documentId: documentId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as DocumentInterface[];
    return parsedResult;
  }

  /**
   * Function to get students documents
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudentDocuments(
    currentUserId: string | undefined
  ): Promise<DocumentInterface[]> {
    const result = await runStoredProcedure(
      "SP_Documents_GetStudentDocuments",
      {
        IN_currentUserId: currentUserId,
      }
    );

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as DocumentInterface[];
    return parsedResult;
  }

  /**
   * Function to get the student top five last created documents
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getTopStudentDocuments(
    currentUserId: string | undefined
  ): Promise<DocumentInterface[]> {
    const result = await runStoredProcedure(
      "SP_Documents_GetTopFiveStudentDocuments",
      {
        IN_currentUserId: currentUserId,
      }
    );

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as DocumentInterface[];
    return parsedResult;
  }

  /**
   * Function to create a student document
   * @param courseId Course object with the new data
   * @param title Document title
   * @param description Document description
   * @param labels Document labels
   * @param firebaseUrl Firebase url to the document
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async createStudentDocument(
    title: string,
    description: string,
    labels: string,
    firebaseUrl: string,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Documents_CreateStudentDocument",
      {
        IN_title: title,
        IN_description: description,
        IN_labels: labels,
        IN_firebaseUrl: firebaseUrl,
        IN_currentUserId: currentUserId,
      }
    );
    return result[0][0].affectedEntityId;
  }

  /**
   * Function to update a personal document
   * @param documentId Document object with the new data
   * @param title Document title
   * @param description Document description
   * @param labels Document labels
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async updateStudentDocuments(
    documentId: string | undefined,
    title: string,
    description: string,
    labels: string,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Documents_UpdateStudentDocument",
      {
        IN_documentId: documentId,
        IN_title: title,
        IN_description: description,
        IN_labels: labels,
        IN_currentUserId: currentUserId,
      }
    );

    // Recuerden que no siempre viene el resultado
    if (!result || result.length === 0) {
      return false;
    }
    return result[0][0].affectedEntityId;
  }

  /**
   * Function to delete a student personal document in the database
   * @param document document object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async deleteStudentDocument(
    documentId: string,
    currentUserId: string
  ): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Documents_DeleteStudentDocument",
      {
        IN_documentId: documentId,
        IN_currentUserId: currentUserId,
      }
    );
    return result[0][0].affectedEntityId;
  }
}
