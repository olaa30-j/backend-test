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

      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      } else {
        req.body.image = DEFAULT_IMAGE_URL;
      }

      if (!fname || !lname || !gender || !familyBranch || !familyRelationship) {
        return next(
          createCustomError(
            "First name, last name, gender, familyRelationship and family branch are required.",
            HttpCode.BAD_REQUEST
          )
        );
      }

      // check fullName is unique
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

      if (familyRelationship === "الجدالأعلى") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "الجدالأعلى",
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
              "Family head (الجدالأعلى) must be male",
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      if (wives && Array.isArray(wives) && wives.length > 0) {
        const wifeMembers = await Member.find({ _id: { $in: wives } });

        if (wifeMembers.length !== wives.length) {
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
      }

      if (familyRelationship === "زوجة" && husband) {
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

        // check husband doesot include the wife add her
        if (!husbandMember.wives?.includes(req.body._id)) {
          await Member.findByIdAndUpdate(
            husband,
            { $addToSet: { wives: req.body._id } },
            { new: true }
          );
        }
      }

      if (parents?.father || parents?.mother) {
        req.body.parents = {};
        if (parents.father && mongoose.Types.ObjectId.isValid(parents.father)) {
          req.body.parents.father = parents.father;
        }
        if (parents.mother && mongoose.Types.ObjectId.isValid(parents.mother)) {
          req.body.parents.mother = parents.mother;
        }
      }

      // check if parents have the child, if donot have add the child in father and mother schema
      req.body.parents = req.body.parents || {};

      if (parents?.father || parents?.mother) {
        if (parents.father && mongoose.Types.ObjectId.isValid(parents.father)) {
          req.body.parents.father = parents.father;
          await Member.findByIdAndUpdate(
            parents.father,
            { $addToSet: { children: req.body._id } },
            { new: true }
          );
        }

        if (parents.mother && mongoose.Types.ObjectId.isValid(parents.mother)) {
          req.body.parents.mother = parents.mother;
          await Member.findByIdAndUpdate(
            parents.mother,
            { $addToSet: { children: req.body._id } },
            { new: true }
          );
        }
      }

      if (
        children &&
        typeof children === "string" &&
        mongoose.Types.ObjectId.isValid(children)
      ) {
        req.body.children = [children];
      }

      const member = await Member.create(req.body);

      await notifyUsersWithPermission(
        { entity: "عضو", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاءعضو جديد",
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

      res.status(HttpCode.CREATED).json({
        success: true,
        message: "Member created successfully",
        data: member,
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

      const member = await Member.findById(id);
      if (!member) {
        return next(createCustomError("Member not found", HttpCode.NOT_FOUND));
      }

      if (req.file?.path) {
        req.body.image = req.file.path.replace(/\\/g, "/");
      }

      if (familyRelationship === "الجدالأعلى" && member.familyRelationship !== "الجدالأعلى") {
        const existingHead = await Member.findOne({
          familyBranch,
          familyRelationship: "الجدالأعلى",
          _id: { $ne: member._id },
        });
        if (existingHead) {
          return next(
            createCustomError(
              `This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`,
              HttpCode.BAD_REQUEST
            )
          );
        }
      }

      if (husband) {
        const husbandMember = await Member.findById(husband);
        if (!husbandMember) {
          return next(
            createCustomError("Husband not found", HttpCode.BAD_REQUEST)
          );
        }
      }

      if (parents?.father || parents?.mother) {
        req.body.parents = {};
        if (parents.father && mongoose.Types.ObjectId.isValid(parents.father)) {
          req.body.parents.father = parents.father;
        }
        if (parents.mother && mongoose.Types.ObjectId.isValid(parents.mother)) {
          req.body.parents.mother = parents.mother;
        }
      }

      let updatedMember;
      if (
        children &&
        typeof children === "string" &&
        mongoose.Types.ObjectId.isValid(children)
      ) {
        updatedMember = await Member.findByIdAndUpdate(
          id,
          {
            $addToSet: { children },
            $set: req.body,
          },
          { new: true, runValidators: true }
        )
          .populate("userId")
          .populate("husband")
          .populate("wives")
          .populate("parents")
          .populate("children");
      } else {
        updatedMember = await Member.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        })
          .populate("userId")
          .populate("husband")
          .populate("wives")
          .populate("parents")
          .populate("children");
      }

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
        data: updatedMember,
        message: "Member updated successfully",
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
