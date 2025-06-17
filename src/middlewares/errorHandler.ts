import { Request, Response, NextFunction } from "express";
import { CustomError, HttpCode } from "../errors/customError";
import { Error } from "mongoose";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: HttpCode.INTERNAL_SERVER_ERROR,
    message: "Something went wrong try again later",
  };

  if (err instanceof CustomError) {
    customError.message = err.message;
    customError.statusCode = err.statusCode;
  }

  if (err instanceof Error.ValidationError) {
    customError.message = Object.values(err.errors)
      .map((item: any) => item.message)
      .join(",");
    customError.statusCode = 400;
  }

  if (req.url.startsWith("/api/v1/") && !req.route) {
    customError.statusCode = 404;
    customError.message = "Not Found";
  }

  return res.status(customError.statusCode).json({
    sucess: false,
    message: customError.message,
    statusCode: customError.statusCode,
    data: null,
  });
};

export default errorHandler;
