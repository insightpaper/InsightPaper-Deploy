"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = __importDefault(require("./config/env"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middlewareServices_1 = require("./services/middlewares/middlewareServices");
const status_routes_1 = __importDefault(require("./routes/status.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const questions_routes_1 = __importDefault(require("./routes/questions.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const documents_routes_1 = __importDefault(require("./routes/documents.routes"));
const models_routes_1 = __importDefault(require("./routes/models.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// CORS
app.use((0, cors_1.default)({
    origin: env_1.default.clientBaseUrl,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Middleware
app.use(middlewareServices_1.removeEmptyQueryParams);
app.use(middlewareServices_1.checkAuth);
// Rutas
app.use(status_routes_1.default);
app.use("/api/users", users_routes_1.default);
app.use("/api/courses", courses_routes_1.default);
app.use("/api/questions", questions_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/documents", documents_routes_1.default);
app.use("/api/models", models_routes_1.default);
// Exponer headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    next();
});
exports.default = app;
