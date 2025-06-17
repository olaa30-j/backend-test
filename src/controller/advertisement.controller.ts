import { Request, Response, NextFunction } from "express";
import Advertisement from "../models/advertisement.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";
import { notifyUsersWithPermission } from "../utils/notify";

class AdvertisementController {
  createAdvertisement = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { title, type, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      if (!title || !type || !content) {
        return next(
          createCustomError("Missing required fields", HttpCode.BAD_REQUEST)
        );
      }

      let image;
      if (req.file?.path) {
        image = req.file.path.replace(/\\/g, "/");
      }

      const advertisement = await Advertisement.create({
        userId,
        title,
        type,
        content,
        image,
      });

      await notifyUsersWithPermission(
        { entity: "اعلان", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاء إعلان جديد",
          action: "create",
          entity: { type: "اعلان", id: advertisement._id },
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
        data: advertisement,
        message: "Advertisement created successfully",
      });
    }
  );

  getAllAdvertisements = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalAdvertisements = await Advertisement.countDocuments();
    const advertisements = await Advertisement.find()
      .populate("userId", "-password -permissions -_id ")
      .skip(skip)
      .limit(limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalAdvertisements,
        totalPages: Math.ceil(totalAdvertisements / limit),
        currentPage: page,
        pageSize: advertisements.length,
      },
      data: advertisements,
      message: "Fetched all advertisements successfully",
    });
  });

  getAdvertisementById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
          createCustomError("Invalid advertisement ID", HttpCode.BAD_REQUEST)
        );
      }

      const advertisement = await Advertisement.findById(id).populate(
        "userId",
        "-password -permissions -_id "
      );

      if (!advertisement) {
        return next(
          createCustomError("Advertisement not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: advertisement,
        message: "Fetched advertisement successfully",
      });
    }
  );

  updateAdvertisementById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      let updateData = req.body;

      if (req.file?.path) {
        updateData.image = req.file.path.replace(/\\/g, "/");
      }

      const cleanObject = (obj: any) =>
        Object.fromEntries(
          Object.entries(obj).filter(
            ([, value]) => value !== null && value !== undefined && value !== ""
          )
        );
      updateData = cleanObject(updateData);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
          createCustomError("Invalid advertisement ID", HttpCode.BAD_REQUEST)
        );
      }

      const advertisement = await Advertisement.findById(id);

      if (!advertisement) {
        return next(
          createCustomError("Advertisement not found", HttpCode.NOT_FOUND)
        );
      }

      const updatedAdvertisement = await Advertisement.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      await notifyUsersWithPermission(
        { entity: "اعلان", action: "update", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم تعديل إعلان  ",
          action: "update",
          entity: { type: "اعلان", id: advertisement._id },
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
        data: updatedAdvertisement,
        message: "Advertisement updated successfully",
      });
    }
  );

  deleteAdvertisementById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(
          createCustomError("Invalid advertisement ID", HttpCode.BAD_REQUEST)
        );
      }

      const advertisement = await Advertisement.findById(id);

      if (!advertisement) {
        return next(
          createCustomError("Advertisement not found", HttpCode.NOT_FOUND)
        );
      }

      await advertisement.deleteOne();

      await notifyUsersWithPermission(
        { entity: "اعلان", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم حذف إعلان",
          action: "delete",
          entity: { type: "اعلان", id: advertisement._id },
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
        data: null,
        message: "Advertisement deleted successfully",
      });
    }
  );

  deleteAllAdvertisements = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { confirm } = req.body;

      if (confirm !== "true") {
        return next(
          createCustomError(
            "Confirmation required. Send confirm=true in request body to delete all advertisements",
            HttpCode.BAD_REQUEST
          )
        );
      }

      const result = await Advertisement.deleteMany();

      res.status(HttpCode.OK).json({
        success: true,
        data: { deletedCount: result.deletedCount },
        message: "All advertisements deleted successfully",
      });
    }
  );

  getAdvertisementStats = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const totalAdvertisements = await Advertisement.countDocuments();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newAdvertisementsLast7Days = await Advertisement.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      const newAdvertisements = await Advertisement.find({
        createdAt: { $gte: sevenDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId");

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          totalAdvertisements,
          newAdvertisementsLast7Days,
          newAdvertisements,
          last7DaysStart: sevenDaysAgo,
          last7DaysEnd: new Date(),
        },
        message: "Advertisement statistics retrieved successfully",
      });
    }
  );
}

export default new AdvertisementController();
