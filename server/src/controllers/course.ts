import { ValidationError } from "../errors/ValidationError";
import { Request, Response } from "express";
import CoursesDao from "../daos/course";

export default class CoursesController {
  /**
   * Function to get all courses
   * @param req
   * @param res
   */
  public static async getAllCourses(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getAllCourses(
        Number(req.query.pageNumber),
        Number(req.query.pageSize),
        req.query.filter as string,
        req.query.orderBy as string,
        req.query.orderDirection as string,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting all courses", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a course by id
   * @param req
   * @param res
   * @returns
   *  */
  public static async getCourseById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getCourseById(
        req.params.courseId,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting course by id", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to create a course
   * @param req
   * @param res
   */
  public static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const { name, description, semester } = req.body;

      const result = await CoursesDao.createCourse(
        name,
        description,
        semester,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to Join a course
   * @param req
   * @param res
   */
  public static async JoinCourse(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const { courseCode } = req.body;

      const result = await CoursesDao.JoinCourse(
        courseCode,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error joining course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to Leave a course
   * @param req
   * @param res
   */
  public static async LeaveCourse(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.LeaveCourse(
        req.params.courseId,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error leaving course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to remove a student from a course
   * @param req
   * @param res
   */
  public static async RemoveStudent(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.RemoveStudent(
        req.params.courseId,
        requesterUserId,
        req.body.studentId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error leaving course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a course of a professor
   * @param req
   * @param res
   * @returns
   *  */
  public static async getCoursesProfessor(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getCoursesProfessor(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting professor courses", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a course of a student
   * @param req
   * @param res
   * @returns
   *  */
  public static async getCoursesStudent(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getCoursesStudent(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting student courses", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a course of a student
   * @param req
   * @param res
   * @returns
   *  */
  public static async getStudentActivityCourse(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getStudentActivityCourse(
        requesterUserId,
        req.params.courseId,
        req.params.studentId
      );
      res.status(200).json({ ...result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting student activity course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to update a course
   * @param req
   * @param res
   */
  public static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const { name, description, semester, courseId } = req.body;
      const result = await CoursesDao.updateCourse(
        name,
        description,
        semester,
        requesterUserId,
        courseId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error updating course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to Delete a course
   * @param req
   * @param res
   */
  public static async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.deleteCourse(
        req.params.courseId,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getStudentByCourses(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await CoursesDao.getStudentByCourses(
        req.params.courseId,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the list of students by course", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getStudentByProfessor(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await CoursesDao.getStudentByProfessor(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the list of students by professor", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
}
