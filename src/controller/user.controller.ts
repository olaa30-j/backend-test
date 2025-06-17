import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import User from "../models/user.model";
import { HttpCode, createCustomError } from "../errors/customError";
import { hashPassword } from "../utils/password";
import Tenant from "../models/tenant.model";
import Permission from "../models/permission.model";
import {
  sendAccountStatusEmail,
  sendEmailToUsersWithPermission,
} from "../services/email.service";
import Member from "../models/member.model";
import { notifyUsersWithPermission } from "../utils/notify";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dmhvfuuke/image/upload/v1750092490/avatar_bdtadk.jpg";

class UserController {
  createUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const familyName = "Elsaqar";

      let tenant = await Tenant.findOne({ familyName });
      if (!tenant) {
        tenant = new Tenant({
          familyName,
          slug: familyName.toLowerCase().replace(/\s+/g, "-"),
        });
        await tenant.save();
      }

      let {
        email,
        password,
        phone,
        familyBranch,
        familyRelationship,
        role,
        status,
        address,
      } = req.body;

      const isRequestingSuperAdmin =
        role === "مدير النظام" ||
        (Array.isArray(role) && role.includes("مدير النظام"));

      if (isRequestingSuperAdmin) {
        const existingSuperAdmin = await User.findOne({
          $or: [
            { role: "مدير النظام" },
            { role: { $elemMatch: { $eq: "مدير النظام" } } },
          ],
        });

        if (existingSuperAdmin) {
          return next(
            createCustomError(
              "Only one Super Admin (مدير النظام) can exist in the system",
              HttpCode.CONFLICT
            )
          );
        }
      }

      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return next(
          createCustomError("Email already exists", HttpCode.BAD_REQUEST)
        );
      }

      if (familyRelationship === "زوج") {
        const existingHusband = await User.findOne({
          familyBranch,
          familyRelationship: "زوج",
          status: "مقبول",
        });

        if (existingHusband) {
          return next(
            createCustomError(
              `Branch ${familyBranch} already has an approved husband`,
              HttpCode.CONFLICT
            )
          );
        }
      }

      const permissionRole = await Permission.findOne({ role });
      let permission;

      permission = permissionRole?.permissions;

      if (!role) {
        role = "مستخدم";
        permission = await Permission.findOne({ role });
      }

      const hashedPwd = await hashPassword(password);

      const user = new User({
        tenantId: tenant._id,
        email,
        password: hashedPwd,
        phone,
        familyBranch,
        familyRelationship,
        permissions: permission,
        status,
        address,
      });

      if (req.body.role) {
        user.role = Array.isArray(req.body.role)
          ? req.body.role
          : [req.body.role];
      }

      await user.save();

      const femaleRelationships = new Set(["زوجة", "ابنة"]);
      const gender = femaleRelationships.has(familyRelationship)
        ? "أنثى"
        : "ذكر";

      const newMember = new Member({
        userId: user._id,
        fname: email.split("@")[0],
        lname: "الدهمش",
        gender,
        familyBranch,
        familyRelationship,
        isUser: true,
        image: DEFAULT_IMAGE_URL,
      });

      await newMember.save();

      user.memberId = newMember._id;
      await user.save();

      await notifyUsersWithPermission(
        { entity: "مستخدم", action: "view", value: true },
        {
          sender: { id: req?.user.id, name: `${email.split("@")[0]}` },
          message: "تم إنشاء مستخدم جديد",
          action: "create",
          entity: { type: "مستخدم", id: user._id },
          metadata: {
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      await sendEmailToUsersWithPermission({
        entity: "مستخدم",
        action: "view",
        subject: "تم إنشاء مستخدم جديد",
        content: `
          <h2 style="color: #2F80A2; text-align: center;">تم إضافة مستخدم جديد</h2>
          <p style="margin: 10px 0;"> <strong>${email}</strong>:تم إنشاء حساب جديد بالبريد الالكتروني</p>
          <p style="margin: 10px 0;">يرجى تسجيل الدخول للاطلاع على التفاصيل أو مراجعة الحساب.</p>
        `,
      });

      res.status(HttpCode.CREATED).json({
        success: true,
        data: {
          user,
          member: newMember,
        },
        message: "user created sucessfully",
      });
    }
  );

  getAllUsers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const familyName = "Elsaqar";

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      let tenant = await Tenant.findOne({ familyName });
      const totalUsers = await User.countDocuments({ tenantId: tenant?._id });

      const users = await User.find({ tenantId: tenant?._id })
        .select("-password")
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalUsers / limit);

      res.status(HttpCode.OK).json({
        success: true,
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize: users.length,
        },
        message: "users get sucessfully",
      });
    }
  );

  getUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const user = await User.findById(id).select("-password");

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: user,
        message: "user get sucessfully",
      });
    }
  );

  getUserAuthuser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.user?.id;

      const user = await User.findById(id)
        .select("-password")
        .populate("memberId");

      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: user,
        message: "Auth user get sucessfully",
      });
    }
  );

  deleteUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      const isSuperAdmin = userToDelete?.role?.includes("مدير النظام");

      if (isSuperAdmin) {
        return next(
          createCustomError(
            "Super Admin accounts cannot be deleted.",
            HttpCode.FORBIDDEN
          )
        );
      }

      await userToDelete.deleteOne();
      await notifyUsersWithPermission(
        { entity: "مستخدم", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم حذف مستخدم",
          action: "delete",
          entity: { type: "مستخدم" },
          metadata: {
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      await sendEmailToUsersWithPermission({
        entity: "مستخدم",
        action: "delete",
        subject: "تم حذف مستخدم",
        content: `
          <h2 style="color: #2F80A2; text-align: center;">تم حذف مستخدم</h2>
          <p style="margin: 10px 0;"> <strong>${userToDelete?.email} : تم حذف حساب بالبريد الالكتروني </strong></p>
          <p style="margin: 10px 0;">.يرجى تسجيل الدخول للاطلاع على التفاصيل</p>
        `,
      });

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "User deleted successfully.",
      });
    }
  );

  updateUser = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const loggedInUserId = req.user?.id;

      let updateData = { ...req.body };

      const originalUser = await User.findById(id);

      if (!originalUser) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      if (
        Array.isArray(originalUser?.role) &&
        originalUser.role.includes("مدير النظام") &&
        loggedInUserId !== originalUser?._id.toString()
      ) {
        return next(
          createCustomError(
            "غير مسموح بتعديل دور مدير النظام",
            HttpCode.FORBIDDEN
          )
        );
      }

      if (req.body.role === "مدير النظام") {
        return next(
          createCustomError(
            "غير مسموح بتعديل دور مدير النظام",
            HttpCode.FORBIDDEN
          )
        );
      }

      if (req.body.role) {
        const roles = Array.isArray(req.body.role)
          ? req.body.role
          : [req.body.role];

        updateData.role = roles;

        const permission =
          (await Permission.findOne({
            role: { $in: roles },
          })) ?? (await Permission.findOne({ role: "مستخدم" }));

        updateData.permissions = permission?.permissions;
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (updatedUser?.status !== originalUser.status) {
        if (
          updatedUser?.status === "مقبول" ||
          updatedUser?.status === "مرفوض"
        ) {
          sendAccountStatusEmail(updatedUser);
        }
      }

      await notifyUsersWithPermission(
        { entity: "مستخدم", action: "update", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم تعديل مستخدم",
          action: "create",
          entity: { type: "مستخدم", id: updatedUser?._id },
          metadata: {
            deepLink: `/users/${updatedUser?._id}`,
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      await sendEmailToUsersWithPermission({
        entity: "مستخدم",
        action: "update",
        subject: "تم إنشاء تعديل مستخدم",
        content: `
          <h2 style="color: #2F80A2; text-align: center;">تم تعديل مستخدم</h2>
          <p style="margin: 10px 0;"> <strong>${updatedUser?.email} : تم تعديل حساب بالبريد الالكتروني </strong></p>
          <p style="margin: 10px 0;">.يرجى تسجيل الدخول للاطلاع على التفاصيل</p>
        `,
      });

      res.status(HttpCode.OK).json({
        success: true,
        data: updatedUser,
        message: "user updated sucessfully",
      });
    }
  );

  updatePermissions = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { entity, action, value } = req.body;

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

      const user = await User.findById(id);
      if (!user) throw createCustomError("User not found", HttpCode.NOT_FOUND);

      const permission = user.permissions.find(
        (perm: any) => perm.entity === entity
      );

      if (permission) {
        permission[action] = value;
      }

      await user.save();

      res.status(HttpCode.OK).json({
        success: true,
        message: `Permission '${action}' for '${entity}' updated successfully`,
        data: user.permissions,
      });
    }
  );

  deleteRoleFromAllUsers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("user");
      const { role } = req.body;

      if (!role || typeof role !== "string") {
        return next(
          createCustomError(
            "Role name is required and must be a string",
            HttpCode.BAD_REQUEST
          )
        );
      }

      if (role === "مدير النظام" || role === "مستخدم") {
        return next(
          createCustomError(
            "Cannot remove super admin and user role from the system",
            HttpCode.FORBIDDEN
          )
        );
      }

      const usersWithRole = await User.find({ role: { $in: [role] } });

      if (usersWithRole.length === 0) {
        return next(
          createCustomError(
            `No users found with the role '${role}'`,
            HttpCode.NOT_FOUND
          )
        );
      }

      const updateResult = await User.updateMany({ role: { $in: [role] } }, [
        {
          $set: {
            role: {
              $filter: {
                input: "$role",
                as: "r",
                cond: { $ne: ["$$r", role] },
              },
            },
          },
        },
        {
          $set: {
            role: {
              $cond: {
                if: { $eq: [{ $size: "$role" }, 0] },
                then: ["مستخدم"],
                else: "$role",
              },
            },
          },
        },
      ]);

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          roleRemoved: role,
        },
        message: `Role '${role}' removed from ${updateResult.modifiedCount} users successfully`,
      });
    }
  );

    swapMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.params;
      const { newMemberId } = req.body;

      // التحقق من وجود المستخدم والعضو الجديد
      const user = await User.findById(userId);
      if (!user) {
        return next(createCustomError("User not found", HttpCode.NOT_FOUND));
      }

      const newMember = await Member.findById(newMemberId);
      if (!newMember) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }

      // حفظ العضو الحالي للرجوع إليه إذا لزم الأمر
      const currentMemberId = user.memberId;

      // تحديث المستخدم ليشير إلى العضو الجديد
      user.memberId = newMember._id;
      await user.save();

      // تحديث العضو الجديد ليشير إلى المستخدم وجعله isUser = true
      newMember.userId = user._id;
      newMember.isUser = true;
      await newMember.save();

      // إذا كان هناك عضو مرتبط سابقاً، نجعله isUser = false ونزيل userId
      if (currentMemberId) {
        const currentMember = await Member.findById(currentMemberId);
        if (currentMember) {
          currentMember.userId = undefined;
          currentMember.isUser = false;
          await currentMember.save();
        }
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          user,
          newMember,
        },
        message: "Member swapped successfully",
      });
    }
  );
  
  getUsersStats = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const familyName = "Elsaqar";

      const tenant = await Tenant.findOne({ familyName });
      if (!tenant) {
        return next(createCustomError("Tenant not found", HttpCode.NOT_FOUND));
      }

      const totalUsers = await User.countDocuments({ tenantId: tenant._id });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newUsers = await User.countDocuments({
        tenantId: tenant._id,
        createdAt: { $gte: sevenDaysAgo },
      });

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          totalUsers,
          newUsers,
          newUsersTimeframe: "last 7 days",
        },
        message: "Users count retrieved successfully",
      });
    }
  );
}

export default new UserController();
