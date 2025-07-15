/**
 * Custom error class for internal server errors
 * @param message The error message
 * @returns A new instance of the InternalServerError class
 * @example throw new InternalServerError("Internal server error");
 */
export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
