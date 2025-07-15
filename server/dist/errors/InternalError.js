"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
/**
 * Custom error class for internal server errors
 * @param message The error message
 * @returns A new instance of the InternalServerError class
 * @example throw new InternalServerError("Internal server error");
 */
class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.name = "InternalServerError";
    }
}
exports.InternalServerError = InternalServerError;
