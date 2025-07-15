import { ValidationError } from "../errors/ValidationError";
import { Request, Response } from "express";
import axios from "axios";
import ExcelJS from "exceljs";
import QuestionDao from "../daos/question";
import DocumentsDao from "../daos/document";
import { SearchInterface } from "../interfaces/Searches/Search";
import { axiosInstance } from "../services/AxiosInstance";

export default class QuestionController {
  /**
   * Function to search
   * @param req
   * @param res
   */
  public static async gptSearch(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const courseId = req.params.courseId;
      const { question, documentsNumber } = req.body;

      if (!question) {
        throw new ValidationError("Question is required");
      }

      const response = await axiosInstance.post("gptSearch/", {
        question,
        courseId,
        documentsNumber,
      });
      const matches = response.data.matches;
      const documentIds = matches.map((match: any) => match.documentId);
      const results = await Promise.all(
        documentIds.map((id: string) =>
          DocumentsDao.getDocumentById(id, requesterUserId).catch((error) => {
            console.error(`Error getting document:`, error);
            res.status(500).json({ error: "Error getting document" });
          })
        )
      );
      const documents = results.filter((doc) => doc !== null);

      res.status(200).json({ documents: documents.flat() });
    } catch (error: any) {
      console.log(error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "gpt_search_error" });
      } else {
        console.error("Error searching", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to do a full context search
   * @param req
   * @param res
   */
  public static async gptFullContext(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const courseId = req.params.courseId;
      const { question } = req.body;
      console.log("Iniciando busqueda");
      if (!question) {
        throw new ValidationError("Question is required");
      }

      const documents = await DocumentsDao.getDocuments(
        courseId,
        requesterUserId
      );
      
      const response = await axiosInstance.post("gptContext/", {
        question,
        documents: documents.documents,
      });

      const parsed = JSON.parse(response.data.gptResponse) as SearchInterface;
      
      const documentIds = Array.isArray(parsed.ids)
        ? parsed.ids
        : typeof parsed.ids === "string"
        ? [parsed.ids]
        : [];
      
      const results = await Promise.all(
        documentIds.map((id: string) =>
          DocumentsDao.getDocumentById(id, requesterUserId).catch((error) => {
            console.error(`Error getting document`, error);
            return null;
          })
        )
      );  
      // Lo que hace esta linea es aplanar el arreglo y luego filtrar los valores nulos
      const flatResults = results.flat().filter(Boolean);
      // Cuando ocurre un error, el array sin nulos es mas pequeño que el original
      // por lo que si no son iguales, significa que hubo un error
      if (flatResults.length != results.length) {
        res.status(500).json({ error: "unexpected_error" });
        return;
      }
      const foundDocuments = results.filter((doc) => doc !== null);
      res.status(200).json({
        documents: foundDocuments.flat(),
      });
    } catch (error: any) {
      console.log(error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "gpt_search_error" });
      } else {
        console.error("Error searching", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to post a question
   * @param req
   * @param res
   */
  public static async postQuestionLLM(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const documentId = req.params.documentId;
      const requesterUserId = req.user.userId;
      const { question, model } = req.body;

      if (!question) {
        throw new ValidationError("Question is required");
      }

      const chatHistory = await QuestionDao.getHistory(
        documentId,
        requesterUserId
      );

      const response = await axiosInstance.post("llm/", {
        question,
        provider: model,
        chatHistory,
      });

      const questionId = await QuestionDao.postQuestion(
        question,
        documentId,
        requesterUserId
      );
      console.log();
      const ResponseResult = await QuestionDao.postResponse(
        response.data.answer,
        questionId,
        requesterUserId
      );

      res.status(200).json({ answer: response.data.answer });
    } catch (error: any) {
      console.log(error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else if (axios.isAxiosError(error)) {
        res.status(500).json({ error: "llm_error" });
      } else {
        console.error("Error posting the question", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to post a question
   * @param req
   * @param res
   */
  public static async postQuestion(req: Request, res: Response): Promise<void> {
    try {
      const documentId = req.params.documentId;
      const requesterUserId = req.user.userId;
      const { question } = req.body;

      const result = await QuestionDao.postQuestion(
        question,
        documentId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error posting the question", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to post a response
   * @param req
   * @param res
   */
  public static async postResponse(req: Request, res: Response): Promise<void> {
    try {
      const questionId = req.params.questionId;
      const requesterUserId = req.user.userId;
      const { response } = req.body;

      const result = await QuestionDao.postResponse(
        response,
        questionId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error posting the response", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the history of questions
   * @param req
   * @param res
   */

  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const documentId = req.params.documentId;
      const requesterUserId = req.user.userId;
      const result = await QuestionDao.getHistory(documentId, requesterUserId);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the history of questions", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getChat(req: Request, res: Response): Promise<void> {
    try {
      const documentId = req.params.documentId;
      const userId = req.params.studentId;
      const requesterUserId = req.user.userId;

      const result = await QuestionDao.getStudentChat(
        documentId,
        userId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        console.error("Error getting the history of questions", error);
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the history of questions", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async downloadHistory(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { documentId, studentId } = req.params;
      const requesterUserId = req.user.userId;
      let history;
      if (studentId){
        history = await QuestionDao.getStudentHistory(
          documentId,
          studentId,
          requesterUserId
        );
      } else {
        history = await QuestionDao.getHistory(documentId, requesterUserId);
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Historial");

      worksheet.columns = [
        { header: "Pregunta", key: "question", width: 60 },
        { header: "Respuesta", key: "response", width: 60 },
        { header: "Evaluación", key: "evaluation", width: 15 },
        { header: "Fecha Pregunta", key: "questionCreatedDate", width: 20 },
        { header: "Fecha Respuesta", key: "responseCreatedDate", width: 20 },
      ];

      history.forEach((entry) => {
        worksheet.addRow({
          question: entry.question,
          response: entry.response,
          evaluation: entry.evaluation,
          questionCreatedDate: entry.questionCreatedDate,
          responseCreatedDate: entry.responseCreatedDate,
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=historial-chat.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the history of questions", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the history of questions
   * @param req
   * @param res
   */

  public static async getStudentChats(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { courseId, studentId } = req.params;
      const requesterUserId = req.user.userId;
      const result = await QuestionDao.getStudentChats(
        studentId,
        courseId,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the history of questions", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to evaluate a question
   * @param req
   * @param res
   */
  public static async evaluateQuestion(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const questionId = req.params.questionId;
      const requesterUserId = req.user.userId;
      const { evaluation } = req.body;

      const result = await QuestionDao.evaluateQuestion(
        evaluation,
        questionId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error evaluating the question", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to post a comment
   * @param req
   * @param res
   */
  public static async postComment(req: Request, res: Response): Promise<void> {
    try {
      const questionId = req.params.questionId;
      const requesterUserId = req.user.userId;
      const { comment, isPrivate } = req.body;

      const result = await QuestionDao.postComment(
        comment,
        questionId,
        requesterUserId,
        isPrivate
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error posting the comment", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
}
