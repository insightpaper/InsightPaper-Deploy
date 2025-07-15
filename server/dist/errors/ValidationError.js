"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
/**
 * Custom error class for validation errors
 * @param message The error message
 * @param cause The cause of the error
 * @returns A new instance of the ValidationError class
 * @example throw new ValidationError("Invalid email", "Email is required");
 */
class ValidationError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = "ValidationError";
        this.cause = cause;
    }
}
exports.ValidationError = ValidationError;
