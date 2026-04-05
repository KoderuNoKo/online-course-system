export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const forbidden = (message = "Forbidden") =>
  new AppError(403, "FORBIDDEN", message);
export const unauthorized = (message = "Unauthorized") =>
  new AppError(401, "UNAUTHORIZED", message);
export const badRequest = (message = "Bad request") =>
  new AppError(400, "BAD_REQUEST", message);
export const notFound = (message = "Not found") =>
  new AppError(404, "NOT_FOUND", message);
