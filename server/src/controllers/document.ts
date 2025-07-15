import { ValidationError } from "../errors/ValidationError";
import { Request, Response } from "express";
import DocumentsDao from "../daos/document";
import CoursesDao from "../daos/course";
import { sendNotificationNewDocument } from "../services/emailService";
import { axiosInstance } from "../services/AxiosInstance";

export default class DocumentsController {
  /**
   * Function to get a documents by id
   * @param req
   * @param res
   * @returns
   *  */
  public static async getDocuments(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;


      const { pageNumber, pageSize, orderBy, orderDirection } = req.query;

      const result = await DocumentsDao.getDocuments(
        req.params.courseId,
        requesterUserId,
        Number(pageNumber),
        Number(pageSize),
        orderBy as string,
        orderDirection as "ASC" | "DESC"
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the courses documents", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to Delete a document
   * @param req
   * @param res
   */
  public static async deleteDocument(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const documentId = req.params.documentId;
      const courseId = req.params.courseId;
      const result = await DocumentsDao.deleteDocument(
        documentId,
        requesterUserId
      );

      const resultSearch = await axiosInstance.post("deleteDocumentPinecone/", {
        documentId,
        courseId,
      });

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the history
   * @param req
   * @param res
   * @returns
   *  */
  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await DocumentsDao.getHistory(
        req.params.documentId,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the history", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to update a document
   * @param req
   * @param res
   * @returns
   *  */
  public static async updateDocument(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const { documentId, title, description, labels, firebaseUrl } = req.body;
      const result = await DocumentsDao.updateDocument(
        documentId,
        title,
        description,
        labels,
        firebaseUrl,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error updating a document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to create a document
   * @param req
   * @param res
   * @returns
   *  */
  public static async createDocument(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const { courseId, title, description, labels, firebaseUrl } = req.body;
      const documentId = await DocumentsDao.createDocument(
        title,
        description,
        labels,
        firebaseUrl,
        courseId,
        requesterUserId
      );

      const resultSearch = await axiosInstance.post("addDocumentPinecone/", {
        documentId,
        title,
        description,
        labels,
        firebaseUrl,
        courseId,
      });
      const emails = await CoursesDao.getCourseEmails(
        courseId,
        requesterUserId
      );

      let allSent = true;

      for (const { courseName, studentEmail } of emails) {
        try {
          const answer = await sendNotificationNewDocument(
            studentEmail,
            courseName
          );
          if (!answer) {
            console.warn(`No se pudo enviar correo a ${studentEmail}`);
            allSent = false;
          }
        } catch (error) {
          console.error(`Error al enviar a ${studentEmail}:`, error);
          allSent = false;
        }
      }

      if (!allSent) {
        res.status(400).json({ result: "notification_error" });
        return;
      }
      res.status(200).json({ documentId });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating a document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a documents by id
   * @param req
   * @param res
   * @returns
   *  */
  public static async getDocumentById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await DocumentsDao.getDocumentById(
        req.params.documentId,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting documents by id", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the student documents
   * @param req
   * @param res
   * @returns
   *  */
  public static async getStudentDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await DocumentsDao.getStudentDocuments(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the student documents", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the student top five last created documents
   * @param req
   * @param res
   * @returns
   *  */
  public static async getTopStudentDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await DocumentsDao.getTopStudentDocuments(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the student top five documents", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to create a student document
   * @param req
   * @param res
   * @returns
   *  */
  public static async createStudentDocument(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const { title, description, labels, firebaseUrl } = req.body;
      const result = await DocumentsDao.createStudentDocument(
        title,
        description,
        labels,
        firebaseUrl,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating a student document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to update a personal document
   * @param req
   * @param res
   * @returns
   *  */
  public static async updateStudentDocuments(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const documentId = req.params.documentId;
      const { title, description, labels } = req.body;
      const result = await DocumentsDao.updateStudentDocuments(
        documentId,
        title,
        description,
        labels,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error updating the personal document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to Delete a student document
   * @param req
   * @param res
   */
  public static async deleteStudentDocument(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const documentId = req.params.documentId;

      const result = await DocumentsDao.deleteStudentDocument(
        documentId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting document", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
}
