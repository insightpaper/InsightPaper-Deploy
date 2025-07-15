import { runStoredProcedure } from "../services/databaseService";
import { recordSetToJsonString } from "../utils/jsonParser";
import {
  QuestionInterface,
  ChatInterface,
} from "../interfaces/Questions/Question";
export default class QuestionDao {
  /**
   * Function to post a question
   * @param question Pregunta realizada
   * @param documentId ID del documento
   * @param currentUserId ID del usuario activo
   * @returns question id
   */
  public static async postQuestion(
    question: string,
    documentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<string> {
    const result = await runStoredProcedure("SP_Questions_CreateQuestion", {
      IN_question: question,
      IN_documentId: documentId,
      IN_currentUserId: currentUserId,
    });

    return result[0][0].affectedEntityId;
  }

  /**
   * Function to post a response
   * @param response Pregunta realizada
   * @param questionId ID de la pregunta
   * @param currentUserId ID del usuario activo
   * @returns reponse id
   */
  public static async postResponse(
    response: string,
    questionId: string | undefined,
    currentUserId: string | undefined
  ): Promise<string> {
    const result = await runStoredProcedure("SP_Questions_CreateResponse", {
      IN_response: response,
      IN_questionId: questionId,
      IN_currentUserId: currentUserId,
    });

    return result[0][0].affectedEntityId;
  }

  /**
   * Function to get the history of questions
   * @param documentId Id of the document
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getHistory(
    documentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<QuestionInterface[]> {
    const result = await runStoredProcedure("SP_Questions_GetHistory", {
      IN_documentId: documentId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as QuestionInterface[];

    return parsedResult;
  }


  public static async getStudentHistory(
    documentId: string | undefined,
    studentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<QuestionInterface[]> {
    const result =  await runStoredProcedure('SP_Questions_GetStudentHistory', {
      IN_documentId: documentId,
      IN_studentId: studentId,
      IN_currentUserId: currentUserId,
    })
    
    const jsonString = recordSetToJsonString(result);
    if (!jsonString || jsonString.trim() === "") {
      return [];
    }
    const parsedResult = JSON.parse(jsonString) as QuestionInterface[];
    return parsedResult;
  }


  public static async getStudentChat(
    documentId: string | undefined,
    studentId: string | undefined,
    currentUserId: string | undefined
  ): Promise<QuestionInterface[]> {
    const result = await runStoredProcedure(
      "SP_Questions_GetStudentSingleChat",
      {
        IN_currentUserId: currentUserId,
        IN_studentId: studentId,
        IN_documentId: documentId,
      }
    );

    const jsonString = recordSetToJsonString(result);
    if (!jsonString || jsonString.trim() === "") {
      return [];
    }
    const parsedResult = JSON.parse(jsonString) as QuestionInterface[];
    return parsedResult;
  }

  /**
   * Function to get the chats history
   * @param courseId Id of the course
   * @param studentId Id of the student
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getStudentChats(
    studentId: string | undefined,
    courseId: string | undefined,
    currentUserId: string | undefined
  ): Promise<ChatInterface[]> {
    const result = await runStoredProcedure("SP_Questions_GetStudentChats", {
      IN_courseId: courseId,
      IN_studentId: studentId,
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as ChatInterface[];

    return parsedResult;
  }

  /**
   * Function to post a response
   * @param response Pregunta realizada
   * @param questionId ID de la pregunta
   * @param currentUserId ID del usuario activo
   * @returns reponse id
   */
  public static async evaluateQuestion(
    evaluation: boolean,
    questionId: string | undefined,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Questions_EvaluateQuestion", {
      IN_evaluation: evaluation,
      IN_questionId: questionId,
      IN_currentUserId: currentUserId,
    });

    return result[0][0].affectedEntityId;
  }

  /**
   * Function to post a response
   * @param response Pregunta realizada
   * @param questionId ID de la pregunta
   * @param currentUserId ID del usuario activo
   * @returns reponse id
   */
  public static async postComment(
    comment: string,
    questionId: string | undefined,
    currentUserId: string | undefined,
    isPrivate: boolean
  ): Promise<string> {
    const result = await runStoredProcedure("SP_Questions_CreateComment", {
      IN_comment: comment,
      IN_currentUserId: currentUserId,
      IN_questionId: questionId,
      IN_isPrivate: isPrivate,
    });

    return result[0][0].affectedEntityId;
  }
}
