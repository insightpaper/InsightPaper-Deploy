import { Request, Response } from "express";
import { testConnection } from "../services/databaseService";

/**
 * Returns the status of the server
 */
export function getStatus(req: Request, res: Response) {
  testConnection(5000)
    .then(() => {
      res
        .status(200)
        .json({ server: "ok", database: "ok", timestamp: new Date() });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ server: "ok", database: "error", timestamp: new Date() });
      console.error(error);
    });
}
