import { ValidationError } from "../errors/ValidationError";
import { Request, Response } from "express";
import ModelDao from "../daos/model";

export default class ModelController {
  /**
   * Function to get all the models information
   * @param req
   * @param res
   */

  public static async getModels(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const result = await ModelDao.getModels(requesterUserId);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting all the models", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
}
