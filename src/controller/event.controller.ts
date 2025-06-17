import { Request, Response, NextFunction } from "express";
import Event from "../models/event.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";
import {
  validateDate,
  validateDateRange,
  validateFutureDate,
} from "../utils/dateValidator";
import { notifyUsersWithPermission } from "../utils/notify";

class EventController {
  createEvent = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { address, description, location, startDate, endDate } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      if (!address || !description || !location || !startDate) {
        return next(
          createCustomError("Missing required fields", HttpCode.BAD_REQUEST)
        );
      }

      const startDateObj = validateDate(startDate, "startDate");
      validateFutureDate(startDateObj, "startDate");

      const endDateObj = endDate ? validateDate(endDate, "endDate") : null;
      validateDateRange(startDateObj, endDateObj);

      const event = await Event.create({
        userId,
        address,
        description,
        location,
        startDate: startDateObj,
        endDate: endDateObj,
      });
      await notifyUsersWithPermission(
        { entity: "مناسبه", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاء مناسبه جديد",
          action: "create",
          entity: { type: "مناسبه", id: event?._id },
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
        data: event,
        message: "Event created successfully",
      });
    }
  );

  getAllEvents = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalEvents = await Event.countDocuments();
    const events = await Event.find()
      .populate("userId", "-password -permissions -_id ")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalEvents / limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalEvents,
        totalPages,
        currentPage: page,
        pageSize: events.length,
      },
      data: events,
      message: "Fetched all events successfully",
    });
  });

  getEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return next(
          createCustomError("Invalid event ID", HttpCode.BAD_REQUEST)
        );
      }

      const event = await Event.findById(eventId).populate(
        "userId",
        "-password -permissions -_id "
      );

      if (!event) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: event,
        message: "Fetched event successfully",
      });
    }
  );

  deleteEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return next(
          createCustomError("Invalid event ID", HttpCode.BAD_REQUEST)
        );
      }

      const event = await Event.findById(eventId);

      if (!event) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      await event.deleteOne();

      await notifyUsersWithPermission(
        { entity: "مناسبه", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم حذف مناسبه",
          action: "delete",
          entity: { type: "مناسبه", id: event._id },
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
        message: "Event deleted successfully",
      });
    }
  );

  updateEventById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const eventId = req.params.id;
      let updateData = req.body;

      const existingEvent = await Event.findById(eventId);

      if (!existingEvent) {
        return next(createCustomError("Event not found", HttpCode.NOT_FOUND));
      }

      const cleanObject = (obj: any) => {
        return Object.fromEntries(
          Object.entries(obj).filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ""
          )
        );
      };

      updateData = cleanObject(updateData);

      let startDate = updateData.startDate
        ? validateDate(updateData.startDate, "startDate")
        : existingEvent.startDate;

      validateFutureDate(startDate, "startDate");

      let endDate = updateData.endDate
        ? validateDate(updateData.endDate, "endDate")
        : existingEvent.endDate;

      if (updateData.startDate || updateData.endDate) {
        validateDateRange(startDate, endDate);
      }

      if (updateData.startDate) updateData.startDate = startDate;
      if (updateData.endDate) updateData.endDate = endDate;

      const updatedEvent = await Event.findByIdAndUpdate(
        { _id: eventId },
        updateData,
        { new: true }
      );

      await notifyUsersWithPermission(
        { entity: "مناسبه", action: "update", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم تعديل مناسبه  ",
          action: "update",
          entity: { type: "مناسبه", id: updatedEvent?._id },
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
        data: updatedEvent,
        message: "Event updated successfully",
      });
    }
  );

  getEventOverview = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const currentDate = new Date();

      const totalEvents = await Event.countDocuments();

      const endedEvents = await Event.countDocuments({
        $or: [
          { endDate: { $lt: currentDate } },
          {
            startDate: { $lte: currentDate },
            endDate: null,
          },
        ],
      });

      const upcomingEvent = await Event.findOne({
        startDate: { $gt: currentDate },
      })
        .sort({ startDate: 1 })
        .populate("userId")
        .lean();

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          counts: {
            total: totalEvents,
            ended: endedEvents,
            upcoming: totalEvents - endedEvents,
          },
          nextEvent: upcomingEvent || null,
          asOf: currentDate.toISOString(),
        },
        message: "Event overview retrieved successfully",
      });
    }
  );
}

export default new EventController();
