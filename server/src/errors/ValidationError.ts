/**
 * Custom error class for validation errors
 * @param message The error message
 * @param cause The cause of the error
 * @returns A new instance of the ValidationError class
 * @example throw new ValidationError("Invalid email", "Email is required");
 */
export class ValidationError extends Error {
    public cause: string | undefined;
  
    constructor(message: string, cause?: string) {
      super(message);
      this.name = "ValidationError";
      this.cause = cause;
    }
  }