"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmptyQueryParams = exports.checkAuth = void 0;
const auth_1 = require("../../utils/auth");
const unprotectedRoutes_config_1 = __importDefault(require("../../config/unprotectedRoutes.config"));
/**
 * Middleware to check if the route is unprotected
 * @param req
 * @param res
 * @param next
 */
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const routesForMethod = unprotectedRoutes_config_1.default[req.method];
    // Check if the method is supported and if the route is unprotected
    if (routesForMethod && routesForMethod.includes(req.path)) {
        return next();
    }
    const authToken = req.cookies.auth;
    if (!authToken) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const user = yield (0, auth_1.verifyToken)(authToken);
    req.user = user;
    next();
});
exports.checkAuth = checkAuth;
/**
 * Middleware to remove undefined, null, and empty string query parameters
 * @param req
 * @param res
 * @param next
 */
const removeEmptyQueryParams = (req, res, next) => {
    for (const key in req.query) {
        const value = req.query[key];
        if (value === "undefined" || value === "" || value === "null") {
            delete req.query[key];
        }
    }
    next();
};
exports.removeEmptyQueryParams = removeEmptyQueryParams;
