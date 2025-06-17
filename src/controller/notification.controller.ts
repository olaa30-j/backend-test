import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asynHandler";
import { HttpCode, createCustomError } from "../errors/customError";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import mongoose from "mongoose";

class NotificationController {
  getNotifications = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      let baseQuery = {};
      if (req.user.role === "مدير النظام") {
        baseQuery = {
          recipientId: req.user.id,
        };
      } else {
        baseQuery = {
          recipientId: req.user.id,
          show: true,
        };
      }
      const [notifications, total] = await Promise.all([
        Notification.find(baseQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("sender.id", "email")
          .lean(),
        Notification.countDocuments({ recipientId: req.user._id }),
      ]);
      res.status(HttpCode.OK).json({
        success: true,
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "Get all notifications successfuly",
      });
    }
  );

  markAsRead = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipientId: req.user.id },
        { read: true, readAt: new Date(), status: "delivered" },
        { new: true }
      );

      if (!notification) {
        return next(
          createCustomError("Notification not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: notification,
        message: "make notification mark as read",
      });
    }
  );

  markAllAsRead = asyncWrapper(async (req: Request, res: Response) => {
    await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true, readAt: new Date(), status: "delivered" }
    );

    res.status(HttpCode.OK).json({
      success: true,
      message: "تم تعليم جميع الإشعارات كمقروءة",
      data: null,
    });
  });

  getUnreadCount = asyncWrapper(async (req: Request, res: Response) => {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      read: false,
    });

    res.status(HttpCode.OK).json({
      success: true,
      data: { count },
      message: "get the count of unread notification",
    });
  });

  deleteNotification = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipientId: req.user.id,
      });

      if (!notification) {
        return next(
          createCustomError("Notification not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        message: "تم حذف الإشعار بنجاح",
        data: null,
      });
    }
  );

  updateShowByEntityType = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { show, entityType } = req.body;

      const validEntityTypes = [
        "مناسبه",
        "عضو",
        "اعلان",
        "ماليه",
        "معرض الصور",
        "مستخدم",
      ];
      if (!validEntityTypes.includes(entityType)) {
        return next(
          createCustomError("Invalid entity type", HttpCode.BAD_REQUEST)
        );
      }

      const result = await Notification.updateMany(
        {
          "entity.type": entityType,
        },
        { $set: { show: show } }
      );

      res.status(HttpCode.OK).json({
        success: true,
        message: `Updated show status for ${entityType} notifications`,
        data: {
          entityType,
          show,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
      });
    }
  );

  getShowStatusByEntityType = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { entityType } = req.params;
      const notifications = await Notification.find({
        "entity.type": entityType,
      }).select("show");

      const firstShowStatus = notifications[0].show;
      const consistent = notifications.every((n) => n.show === firstShowStatus);

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          entityType,
          show: firstShowStatus,
          consistent,
        },
      });
    }
  );
}

export default new NotificationController();
