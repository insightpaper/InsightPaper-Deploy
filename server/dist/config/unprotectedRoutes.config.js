"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authUnprotectedRoutes = {
    GET: ["/status"],
    POST: [
        "/api/users/login",
        "/api/users/request-password-recovery",
        "/api/users/confirm-password-recovery",
        "/api/users/send-otp",
        "/api/users/verify-otp",
        "/api/users/refresh",
        "/api/users/student/create-user",
        "/api/users/admin/create-user"
    ],
    PUT: ["/api/users/change-password"],
};
exports.default = authUnprotectedRoutes;
