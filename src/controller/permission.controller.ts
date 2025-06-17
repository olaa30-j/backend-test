import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import Permission, { defaultPermissions } from "../models/permission.model";
import User from "../models/user.model";
import mongoose from "mongoose";

class PermissionsController {
  checkPermission = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpCode.CREATED).json({
        success: true,
        data: null,
        message: "you have permission for this action",
      });
    }
  );

  createPermission = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      let { role, permissions } = req.body;

      if (!role) {
        return next(
          createCustomError("Role is required", HttpCode.BAD_REQUEST)
        );
      }

      const roles = [
        "كبار الاسرة",
        "مدير اللجنه الاجتماعية",
        "مدير اللجنه الماليه",
        "مدير النظام",
      ];

      if (!roles.includes(role)) {
        permissions = defaultPermissions;
      }

      const existingPermission = await Permission.findOne({ role });
      if (existingPermission) {
        return next(
          createCustomError(
            "Permission for this role already exists",
            HttpCode.CONFLICT
          )
        );
      }

      const permission = await Permission.create({
        role,
        permissions,
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: permission,
        message: "Permission created successfully",
      });
    }
  );

  getAllPermissions = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalPermissions = await Permission.countDocuments();
    const permissions = await Permission.find().skip(skip).limit(limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalPermissions,
        totalPages: Math.ceil(totalPermissions / limit),
        currentPage: page,
        pageSize: permissions.length,
      },
      data: permissions,
      message: "Permissions retrieved successfully",
    });
  });

  getAllRoles = asyncWrapper(async (req: Request, res: Response) => {
    const roles = await Permission.distinct("role");
    res.status(HttpCode.OK).json({
      success: true,
      data: roles,
      message: "Roles retrieved successfully",
    });
  });

  updatePermissionForRole = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.params;
      const { entity, action, value } = req.body;

      if (role === "مدير النظام") {
        return next(
          createCustomError("غير مسموح بتحديث مدير النظام", HttpCode.FORBIDDEN)
        );
      }
      const allowedEntities = [
        "مناسبه",
        "عضو",
        "مستخدم",
        "معرض الصور",
        "ماليه",
        "اعلان",
      ];

      const allowedActions = ["view", "create", "update", "delete"];

      if (!allowedEntities.includes(entity)) {
        return next(createCustomError("Invalid entity", HttpCode.BAD_REQUEST));
      }

      if (!allowedActions.includes(action)) {
        return next(createCustomError("Invalid action", HttpCode.BAD_REQUEST));
      }

      if (typeof value !== "boolean") {
        return next(
          createCustomError("Value must be a boolean", HttpCode.BAD_REQUEST)
        );
      }

      const permission = await Permission.findOne({ role });
      if (!permission) {
        return next(
          createCustomError("Permission not found", HttpCode.NOT_FOUND)
        );
      }

      const entityPermission: any = permission.permissions.find(
        (perm: any) => perm.entity === entity
      );

      if (entityPermission) {
        entityPermission[action] = value;
      } else {
        permission.permissions.push({ entity, [action]: value });
      }

      await permission.save();

      const usersWithRole = await User.find({ role });
      for (const user of usersWithRole) {
        const userEntityPermission = user.permissions.find(
          (perm: any) => perm.entity === entity
        );
        if (userEntityPermission) {
          userEntityPermission[action] = value;
        } else {
          user.permissions.push({ entity, [action]: value });
        }
        await user.save();
      }

      res.status(HttpCode.OK).json({
        success: true,
        message: `Permission '${action}' for '${entity}' updated successfully`,
        data: permission.permissions,
      });
    }
  );

  deleteRoleAndUpdateUsers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.params;

      if (role === "مدير النظام" || role === "مستخدم") {
        return next(
          createCustomError(
            "غير مسموح بحذف مديرالنظام او مستخدم",
            HttpCode.FORBIDDEN
          )
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      const roleExists = await Permission.exists({ role }).session(session);
      if (!roleExists) {
        await session.abortTransaction();
        return next(createCustomError("Role not found", HttpCode.NOT_FOUND));
      }

      const defaultUserPermissions =
        (await Permission.findOne({ role: "مستخدم" }).session(session))
          ?.permissions || defaultPermissions;

      const usersToUpdate = await User.find({ role }).session(session);

      const bulkOps = usersToUpdate.map((user) => ({
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              role: ["مستخدم"],
              permissions: defaultUserPermissions,
            },
          },
        },
      }));

      if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps, { session });
      }

      await Permission.deleteOne({ role }).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(HttpCode.OK).json({
        success: true,
        message: `Role '${role}' deleted and ${usersToUpdate.length} users updated to 'مستخدم'`,
        data: {
          updatedUsersCount: usersToUpdate.length,
        },
      });
    }
  );
}

export default new PermissionsController();
