import { Request, Response, NextFunction } from "express";
import Jwt, { Secret } from "jsonwebtoken";
import User from "../models/user.model";
import { createCustomError, HttpCode } from "../errors/customError";
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || req.headers.cookie;

  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (authHeader && authHeader.startsWith("accessToken=")) {
    token = authHeader.split("=")[1];
  }

  if (!token) {
    return next(
      createCustomError(`Authorization token not found`, HttpCode.UNAUTHORIZED)
    );
  }

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as Secret);
    req.user = decoded;
    next();
  } catch (error) {
    return next(
      createCustomError(
        `Not authorized to access this route`,
        HttpCode.UNAUTHORIZED
      )
    );
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.role;

    const hasAccess = userRoles.some((role: string) =>
      allowedRoles.includes(role)
    );
    console.log(userRoles);
    if (!hasAccess) {
      return next(
        createCustomError(
          `Unauthorized to access this route`,
          HttpCode.UNAUTHORIZED
        )
      );
    }
    next();
  };
};

export const authorizePermission = (
  entity: string,
  action: "view" | "update" | "create" | "delete"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    if (!userId) {
      return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      return next(createCustomError("User not found", HttpCode.NOT_FOUND));
    }

    const permission = user.permissions.find((p: any) => p.entity === entity);

    if (!permission || !permission[action]) {
      return next(
        createCustomError(
          `You do not have permission to ${action} ${entity}`,
          HttpCode.FORBIDDEN
        )
      );
    }
    console.log("user have permission");
    next();
  };
};

export const authorizePermissionFromBody = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createCustomError("User  not found", HttpCode.NOT_FOUND));
    }

    const { entity, action } = req.body;

    if (!entity || !action) {
      return next(
        createCustomError(
          "Entity and action are required",
          HttpCode.BAD_REQUEST
        )
      );
    }

    const permission = user.permissions.find((p: any) => p.entity === entity);

    if (!permission || !permission[action]) {
      return next(
        createCustomError(
          `You do not have permission to ${action} ${entity}`,
          HttpCode.FORBIDDEN
        )
      );
    }

    console.log("User has permission");
    next();
  };
};
