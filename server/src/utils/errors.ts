export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createBadRequest = (message: string, details?: unknown) =>
  new AppError(400, message, details);

export const createUnauthorized = (message = "Unauthorized") => new AppError(401, message);

export const createForbidden = (message = "Forbidden") => new AppError(403, message);

export const createNotFound = (message = "Not found") => new AppError(404, message);

export const createConflict = (message = "Conflict") => new AppError(409, message);
