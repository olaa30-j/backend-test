export enum HttpCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  UNAUTHENTICATED = 403,
  NOT_FOUND = 404,
  CREATED = 201,
  INTERNAL_SERVER_ERROR = 500,
  FORBIDDEN = 403,
  CONFLICT = 409,
}

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createCustomError = (
  message: string,
  statusCode: number
): CustomError => {
  return new CustomError(message, statusCode);
};
