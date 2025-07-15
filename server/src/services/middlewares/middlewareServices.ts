import * as App from "express";
import { verifyToken } from "../../utils/auth";
import authUnprotectedRoutes from "../../config/unprotectedRoutes.config";

/**
 * Middleware to check if the route is unprotected
 * @param req
 * @param res
 * @param next
 */
export const checkAuth = async (
  req: App.Request,
  res: App.Response,
  next: App.NextFunction
) => {
  const routesForMethod =
    authUnprotectedRoutes[req.method as "GET" | "POST" | "PUT"];

  // Check if the method is supported and if the route is unprotected
  if (routesForMethod && routesForMethod.includes(req.path)) {
    return next();
  }

  const authToken = req.cookies.auth;

  if (!authToken) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const user = await verifyToken(authToken);

  req.user = user;
  next();
};

/**
 * Middleware to remove undefined, null, and empty string query parameters
 * @param req
 * @param res
 * @param next
 */
export const removeEmptyQueryParams = (
  req: App.Request,
  res: App.Response,
  next: App.NextFunction
) => {
  for (const key in req.query) {
    const value = req.query[key];
    if (value === "undefined" || value === "" || value === "null") {
      delete req.query[key];
    }
  }
  next();
};
