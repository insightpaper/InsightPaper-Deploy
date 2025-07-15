import express from "express";
import cors from "cors";
import env from "./config/env";
import cookieParser from "cookie-parser";
import { checkAuth, removeEmptyQueryParams } from "./services/middlewares/middlewareServices";
import statusRoutes from "./routes/status.routes";
import usersRoutes from "./routes/users.routes";
import coursesRoutes from "./routes/courses.routes";
import questionRoutes from "./routes/questions.routes";
import notificationRoutes from "./routes/notification.routes";
import documentsRoutes from "./routes/documents.routes";
import modelsRoutes from "./routes/models.routes";

const app = express();


app.use(express.json());

// CORS
app.use(
  cors({
    origin: env.clientBaseUrl,
    credentials: true,
  })
);
app.use(cookieParser());

// Middleware to remove undefined, null, and empty string query parameters
app.use(removeEmptyQueryParams);

// Middleware to check if the route is unprotected
app.use(checkAuth);

// Routes
app.use(statusRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/models", modelsRoutes);
// Middleware to set the header for all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  next();
});

export default app;
