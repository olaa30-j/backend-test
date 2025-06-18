import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import Member from "../models/member.model";
import { HttpCode, createCustomError } from "../errors/customError";
import User from "../models/user.model";
import mongoose from "mongoose";
import { notifyUsersWithPermission } from "../utils/notify";

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dmhvfuuke/image/upload/v1750092490/avatar_bdtadk.jpg";

class MemberController {
  createMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        fname,
        lname,
        familyBranch,
        familyRelationship,
        gender,
        husband,
        wives,
        parents,
        children,
      } = req.body;

      // التحقق من الحقول المطلوبة
      if (!fname || !lname || !gender || !familyBranch || !familyRelationship) {
        return next(
          createCustomError(
            "First name, last name, gender, familyRelationship and family branch are required.",
            HttpCode.BAD_REQUEST
          )
        );
      }

      // معالجة صورة العضو
      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      } else {
        req.body.image = DEFAULT_IMAGE_URL;
      }

      // التحقق من عدم تكرار الاسم الكامل
      const fullName = `${fname} ${lname}`;
      req.body.fullName = fullName;

      const existingMember = await Member.findOne({ fullName });
      if (existingMember) {
        return next(
          createCustomError(
            `يوجد بالفعل عضو باسم '${fullName}'. يرجى اسم اضافى لتمييز فريد مثل '${fullName} 1'.`,
            HttpCode.BAD_REQUEST
          )
        );
      }

      // التحقق من شروط الجد الأعلى
      if (familyRelationship === "الجد الأعلى") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "الجد الأعلى",
        });

        if (existingHead) {
          return next(
            createCustomError(
              `This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`,
              HttpCode.BAD_REQUEST
            )
          );
        }

        if (gender !== "ذكر") {
          return next(
            createCustomError(
              "Family head (الجد الأعلى) must be male",
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      // إنشاء العضو أولاً بدون العلاقات
      const memberData = { ...req.body };
      // نزيل العلاقات المؤقتة لأننا سنعالجها بعد الإنشاء
      delete memberData.husband;
      delete memberData.wives;
      delete memberData.parents;
      delete memberData.children;

      const member = await Member.create(memberData);

      // الآن نبدأ في معالجة العلاقات بعد إنشاء العضو والحصول على الـ ID

      // 1. معالجة الزوجات (إذا كان العضو ذكراً)
      if (wives && Array.isArray(wives) && wives.length > 0) {
        const wifeMembers = await Member.find({ _id: { $in: wives } });

        if (wifeMembers.length !== wives.length) {
          // ننظف العضو الذي تم إنشاؤه إذا فشلت العملية
          await Member.findByIdAndDelete(member._id);
          return next(
            createCustomError(
              "One or more wives not found",
              HttpCode.BAD_REQUEST
            )
          );
        }

        const nonFemales = wifeMembers.filter((w) => w.gender !== "أنثى");
        if (nonFemales.length > 0) {
          await Member.findByIdAndDelete(member._id);
          return next(
            createCustomError("All wives must be female", HttpCode.BAD_REQUEST)
          );
        }

        // تحديث العضو بإضافة الزوجات
        await Member.findByIdAndUpdate(
          member._id,
          { $set: { wives: wives } },
          { new: true }
        );

        // تحديث كل زوجة بإضافة العضو كزوج
        for (const wifeId of wives) {
          await Member.findByIdAndUpdate(
            wifeId,
            { $set: { husband: member._id } },
            { new: true }
          );
        }
      }

      // 2. معالجة الزوج (إذا كان العضو أنثى)
      if (familyRelationship === "زوجة" && husband) {
        const husbandMember = await Member.findById(husband);
        if (!husbandMember) {
          await Member.findByIdAndDelete(member._id);
          return next(
            createCustomError("Husband not found", HttpCode.BAD_REQUEST)
          );
        }
        if (husbandMember.gender !== "ذكر") {
          await Member.findByIdAndDelete(member._id);
          return next(
            createCustomError("Husband must be male", HttpCode.BAD_REQUEST)
          );
        }
        if (husbandMember.familyBranch !== familyBranch) {
          await Member.findByIdAndDelete(member._id);
          return next(
            createCustomError(
              "Husband must be from the same family branch",
              HttpCode.BAD_REQUEST
            )
          );
        }

        // تحديث العضو بإضافة الزوج
        await Member.findByIdAndUpdate(
          member._id,
          { $set: { husband: husband } },
          { new: true }
        );

        // تحديث الزوج بإضافة العضو كزوجة
        await Member.findByIdAndUpdate(
          husband,
          { $addToSet: { wives: member._id } },
          { new: true }
        );
      }

      // 3. معالجة الآباء
      if (parents?.father || parents?.mother) {
        const updates: any = {};

        if (parents.father && mongoose.Types.ObjectId.isValid(parents.father)) {
          const father = await Member.findById(parents.father);
          if (!father) {
            await Member.findByIdAndDelete(member._id);
            return next(createCustomError("Father not found", HttpCode.BAD_REQUEST));
          }
          updates.parents = { father: parents.father };
          // تحديث الأب بإضافة العضو كطفل
          await Member.findByIdAndUpdate(
            parents.father,
            { $addToSet: { children: member._id } },
            { new: true }
          );
        }

        if (parents.mother && mongoose.Types.ObjectId.isValid(parents.mother)) {
          const mother = await Member.findById(parents.mother);
          if (!mother) {
            await Member.findByIdAndDelete(member._id);
            return next(createCustomError("Mother not found", HttpCode.BAD_REQUEST));
          }
          updates.parents = { ...updates.parents, mother: parents.mother };
          // تحديث الأم بإضافة العضو كطفل
          await Member.findByIdAndUpdate(
            parents.mother,
            { $addToSet: { children: member._id } },
            { new: true }
          );
        }

        // تحديث العضو بإضافة الآباء
        if (Object.keys(updates).length > 0) {
          await Member.findByIdAndUpdate(member._id, updates, { new: true });
        }
      }

      // 4. معالجة الأبناء
      if (children) {
        let childrenArray = Array.isArray(children) ? children : [children];
        childrenArray = childrenArray.filter((c) =>
          mongoose.Types.ObjectId.isValid(c)
        );

        if (childrenArray.length > 0) {
          // التحقق من وجود جميع الأبناء
          const childrenExist = await Member.countDocuments({
            _id: { $in: childrenArray },
          });
          if (childrenExist !== childrenArray.length) {
            await Member.findByIdAndDelete(member._id);
            return next(
              createCustomError("One or more children not found", HttpCode.BAD_REQUEST)
            );
          }

          // تحديث العضو بإضافة الأبناء
          await Member.findByIdAndUpdate(
            member._id,
            { $set: { children: childrenArray } },
            { new: true }
          );

          // تحديث كل ابن بإضافة العضو كأب أو أم حسب الجنس
          for (const childId of childrenArray) {
            if (gender === "ذكر") {
              await Member.findByIdAndUpdate(
                childId,
                { $set: { "parents.father": member._id } },
                { new: true }
              );
            } else {
              await Member.findByIdAndUpdate(
                childId,
                { $set: { "parents.mother": member._id } },
                { new: true }
              );
            }
          }
        }
      }

      // إرسال الإشعارات
      await notifyUsersWithPermission(
        { entity: "عضو", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاء عضو جديد",
          action: "create",
          entity: { type: "عضو", id: member?._id },
          metadata: {
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      // جلب العضو مع جميع تحديثاته
      const updatedMember = await Member.findById(member._id);

      res.status(HttpCode.CREATED).json({
        success: true,
        message: "Member created and updated successfully",
        data: updatedMember,
      });
    }
  );

  updateMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const {
        fname,
        lname,
        familyBranch,
        familyRelationship,
        gender,
        husband,
        wives,
        parents,
        children,
      } = req.body;

      // البحث عن العضو المطلوب تحديثه
      const member = await Member.findById(id);
      if (!member) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }

      // التحقق من الحقول المطلوبة
      if (!fname || !lname || !gender || !familyBranch || !familyRelationship) {
        return next(
          createCustomError(
            "First name, last name, gender, familyRelationship and family branch are required.",
            HttpCode.BAD_REQUEST
          )
        );
      }

      // معالجة صورة العضو
      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      }

      // التحقق من عدم تكرار الاسم الكامل (استثناء العضو الحالي)
      const fullName = `${fname} ${lname}`;
      req.body.fullName = fullName;

      const existingMember = await Member.findOne({
        fullName,
        _id: { $ne: id }
      });
      if (existingMember) {
        return next(
          createCustomError(
            `يوجد بالفعل عضو باسم '${fullName}'. يرجى اسم اضافى لتمييز فريد مثل '${fullName} 1'.`,
            HttpCode.BAD_REQUEST
          )
        );
      }

      // التحقق من شروط الجد الأعلى
      if (familyRelationship === "الجد الأعلى" && member.familyRelationship !== "الجد الأعلى") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "الجد الأعلى",
          _id: { $ne: id }
        });

        if (existingHead) {
          return next(
            createCustomError(
              `This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`,
              HttpCode.BAD_REQUEST
            )
          );
        }

        if (gender !== "ذكر") {
          return next(
            createCustomError(
              "Family head (الجد الأعلى) must be male",
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      // حفظ العلاقات القديمة قبل التحديث
      const oldHusband = member.husband;
      const oldWives = member.wives || [];
      const oldParents = member.parents || {};
      const oldChildren = member.children || [];

      // تحضير بيانات التحديث بدون العلاقات
      const updateData = { ...req.body };
      delete updateData.husband;
      delete updateData.wives;
      delete updateData.parents;
      delete updateData.children;

      // 1. تحديث الزوجات (إذا كان العضو ذكراً)
      if (wives !== undefined) {
        const newWives = Array.isArray(wives) ? wives : [];

        // إزالة العلاقات القديمة
        for (const wifeId of oldWives) {
          await Member.findByIdAndUpdate(
            wifeId,
            { $unset: { husband: "" } },
            { new: true }
          );
        }

        // إضافة العلاقات الجديدة
        if (newWives.length > 0) {
          const wifeMembers = await Member.find({ _id: { $in: newWives } });

          if (wifeMembers.length !== newWives.length) {
            return next(
              createCustomError(
                "One or more wives not found",
                HttpCode.BAD_REQUEST
              )
            );
          }

          const nonFemales = wifeMembers.filter((w) => w.gender !== "أنثى");
          if (nonFemales.length > 0) {
            return next(
              createCustomError("All wives must be female", HttpCode.BAD_REQUEST)
            );
          }

          // تحديث كل زوجة جديدة بإضافة العضو كزوج
          for (const wifeId of newWives) {
            await Member.findByIdAndUpdate(
              wifeId,
              { $set: { husband: id } },
              { new: true }
            );
          }

          updateData.wives = newWives;
        } else {
          updateData.wives = [];
        }
      }

      // 2. تحديث الزوج (إذا كان العضو أنثى)
      if (familyRelationship === "زوجة" && husband !== undefined) {
        // إزالة العلاقة القديمة
        if (oldHusband) {
          await Member.findByIdAndUpdate(
            oldHusband,
            { $pull: { wives: id } },
            { new: true }
          );
        }

        // إضافة العلاقة الجديدة
        if (husband) {
          const husbandMember = await Member.findById(husband);
          if (!husbandMember) {
            return next(
              createCustomError("Husband not found", HttpCode.BAD_REQUEST)
            );
          }
          if (husbandMember.gender !== "ذكر") {
            return next(
              createCustomError("Husband must be male", HttpCode.BAD_REQUEST)
            );
          }
          if (husbandMember.familyBranch !== familyBranch) {
            return next(
              createCustomError(
                "Husband must be from the same family branch",
                HttpCode.BAD_REQUEST
              )
            );
          }

          // تحديث الزوج الجديد بإضافة العضو كزوجة
          await Member.findByIdAndUpdate(
            husband,
            { $addToSet: { wives: id } },
            { new: true }
          );

          updateData.husband = husband;
        } else {
          updateData.husband = null;
        }
      }

      // 3. تحديث الآباء
      if (parents !== undefined) {
        // إزالة العلاقات القديمة
        if (oldParents.father) {
          await Member.findByIdAndUpdate(
            oldParents.father,
            { $pull: { children: id } },
            { new: true }
          );
        }
        if (oldParents.mother) {
          await Member.findByIdAndUpdate(
            oldParents.mother,
            { $pull: { children: id } },
            { new: true }
          );
        }

        // إضافة العلاقات الجديدة
        const newParents: any = {};

        if (parents?.father && mongoose.Types.ObjectId.isValid(parents.father)) {
          const father = await Member.findById(parents.father);
          if (!father) {
            return next(createCustomError("Father not found", HttpCode.BAD_REQUEST));
          }
          newParents.father = parents.father;
          await Member.findByIdAndUpdate(
            parents.father,
            { $addToSet: { children: id } },
            { new: true }
          );
        }

        if (parents?.mother && mongoose.Types.ObjectId.isValid(parents.mother)) {
          const mother = await Member.findById(parents.mother);
          if (!mother) {
            return next(createCustomError("Mother not found", HttpCode.BAD_REQUEST));
          }
          newParents.mother = parents.mother;
          await Member.findByIdAndUpdate(
            parents.mother,
            { $addToSet: { children: id } },
            { new: true }
          );
        }

        updateData.parents = newParents;
      }

      // 4. تحديث الأبناء
      if (children !== undefined) {
        // إزالة العلاقات القديمة
        for (const childId of oldChildren) {
          if (member.gender === "ذكر") {
            await Member.findByIdAndUpdate(
              childId,
              { $unset: { "parents.father": "" } },
              { new: true }
            );
          } else {
            await Member.findByIdAndUpdate(
              childId,
              { $unset: { "parents.mother": "" } },
              { new: true }
            );
          }
        }

        // إضافة العلاقات الجديدة
        let newChildren = Array.isArray(children) ? children : [children];
        newChildren = newChildren.filter((c) =>
          mongoose.Types.ObjectId.isValid(c)
        );

        if (newChildren.length > 0) {
          // التحقق من وجود جميع الأبناء
          const childrenExist = await Member.countDocuments({
            _id: { $in: newChildren },
          });
          if (childrenExist !== newChildren.length) {
            return next(
              createCustomError("One or more children not found", HttpCode.BAD_REQUEST)
            );
          }

          // تحديث كل ابن جديد بإضافة العضو كأب أو أم حسب الجنس
          for (const childId of newChildren) {
            if (member.gender === "ذكر") {
              await Member.findByIdAndUpdate(
                childId,
                { $set: { "parents.father": id } },
                { new: true }
              );
            } else {
              await Member.findByIdAndUpdate(
                childId,
                { $set: { "parents.mother": id } },
                { new: true }
              );
            }
          }

          updateData.children = newChildren;
        } else {
          updateData.children = [];
        }
      }

      // تنفيذ التحديث النهائي
      const updatedMember = await Member.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("userId")
        .populate("husband")
        .populate("wives")
        .populate("parents")
        .populate("children");

      // إرسال الإشعارات
      await notifyUsersWithPermission(
        { entity: "عضو", action: "update", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم تعديل عضو",
          action: "update",
          entity: { type: "عضو", id: updatedMember?._id },
          metadata: {
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      res.status(HttpCode.OK).json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember,
      });
    }
  );
  
  getAllMembers = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const { familyBranch, familyRelationship } = req.query;

      const filter: Record<string, any> = {};

      if (familyBranch) {
        filter.familyBranch = familyBranch;
      }

      if (familyRelationship) {
        filter.familyRelationship = familyRelationship;
      }

      const totalMembers = await Member.countDocuments(filter);

      const members = await Member.find(filter)
        .populate("userId")
        .populate("husband")
        .populate("wives")
        .populate("wives")
        .populate("parents")
        .populate("children")
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalMembers / limit);

      res.status(HttpCode.OK).json({
        success: true,
        data: members,
        pagination: {
          totalMembers,
          totalPages,
          currentPage: page,
          pageSize: members.length,
        },
        message: "Members retrieved successfully",
      });
    }
  );

  getMemberById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const member = await Member.findById(id)
        .populate("userId")
        .populate("husband")
        .populate("wives")
        .populate("parents")
        .populate("parents.father")
        .populate("parents.mother")
        .populate("children");

      if (!member) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }
      res.status(HttpCode.OK).json({
        success: true,
        data: member,
        message: "Member retrieved successfully",
      });
    }
  );

  deleteMember = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const session = await mongoose.startSession();
      session.startTransaction();

      const member = await Member.findById(id).session(session);
      if (!member) {
        await session.abortTransaction();
        session.endSession();
        throw createCustomError("Member not found", HttpCode.NOT_FOUND);
      }

      if (member.userId) {
        await User.findByIdAndDelete(member.userId).session(session);
      }

      await Member.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      session.endSession();

      await notifyUsersWithPermission(
        { entity: "عضو", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم حذف عضو",
          action: "delete",
          entity: { type: "عضو" },
          metadata: {
            priority: "medium",
          },
          status: "sent",
          read: false,
          readAt: null,
        }
      );

      res.status(HttpCode.OK).json({
        success: true,
        message: member.userId
          ? "Member and user deleted successfully"
          : "Member deleted successfully",
        data: null,
      });
    }
  );
}

export default new MemberController();
