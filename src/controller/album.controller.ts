import { Request, Response, NextFunction } from "express";
import Album from "../models/album.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";
import Image from "../models/image.model";
import { notifyUsersWithPermission } from "../utils/notify";

class AlbumController {
  createAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, description } = req.body;
      const userId = req.user?.id;

      if (!name) {
        return next(
          createCustomError("Album name is required", HttpCode.BAD_REQUEST)
        );
      }

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      const album = await Album.create({
        name,
        description,
        createdBy: userId,
      });

      await notifyUsersWithPermission(
        { entity: "معرض الصور", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاءالبوم جديد",
          action: "create",
          entity: { type: "معرض الصور", id: album._id },
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
        data: album,
        message: "Album created successfully",
      });
    }
  );

  getAlbums = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const totalAlbums = await Album.countDocuments();

      const albums = await Album.find()
        .populate("images")
        .populate({
          path: "createdBy",
          select: "-password -permissions -_id",
          populate: {
            path: "memberId",
            select: "-password -permissions -_id",
          },
        })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalAlbums / limit);

      res.status(HttpCode.OK).json({
        success: true,
        pagination: {
          totalAlbums,
          totalPages,
          currentPage: page,
          pageSize: albums.length,
        },
        data: albums,
        message: "Get all albums successfully",
      });
    }
  );

  deleteAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;
      const album = await Album.findById(albumId);

      if (!album) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      await album.deleteOne();

      await notifyUsersWithPermission(
        { entity: "معرض الصور", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: `تم حذف البوم `,
          action: "delete",
          entity: { type: "معرض الصور" },
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
        message: "Album deleted successfully",
      });
    }
  );

  getAlbumById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(albumId)) {
        return next(
          createCustomError("Invalid album ID", HttpCode.BAD_REQUEST)
        );
      }

      const album = await Album.findById(albumId).populate("images").populate({
        path: "createdBy",
        select: "-password -permissions -_id",
        populate: {
          path: "memberId",
          select: "-password -permissions -_id",
        },
      });

      if (!album) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: album,
        message: "Fetched album successfully",
      });
    }
  );

  uploadImageAndAddToAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;
      let { image, description } = req.body;

      if (!req.file?.path || !albumId) {
        return next(
          createCustomError(
            "Image URL and album ID are required",
            HttpCode.BAD_REQUEST
          )
        );
      }

      if (req.file?.path) {
        image = req.file.path.replace(/\\/g, "/");
      }

      const newImage = await Image.create({ image, description });
      await newImage.save();

      const updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        { $push: { images: newImage._id } },
        { new: true }
      )
        .populate("images")
        .populate({
          path: "createdBy",
          select: "-password -permissions -_id",
          populate: {
            path: "memberId",
            select: "-password -permissions -_id",
          },
        });

      if (!updatedAlbum) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      await notifyUsersWithPermission(
        { entity: "معرض الصور", action: "update", value: true },
        {
          sender: { id: req?.user.id },
          message: `${updatedAlbum.name} تم اضافة صورة الى البوم `,
          action: "update",
          entity: { type: "معرض الصور", id: updatedAlbum._id },
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
        message: "Image uploaded and added to album",
        data: updatedAlbum,
      });
    }
  );

  updateAlbumById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const albumId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(albumId)) {
        return next(
          createCustomError("Invalid album ID", HttpCode.BAD_REQUEST)
        );
      }
      const album = await Album.findById(albumId);

      if (!album) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      const updatedAlbum = await Album.findByIdAndUpdate(albumId, req.body, {
        new: true,
        runValidators: true,
      })
        .populate("images")
        .populate({
          path: "createdBy",
          select: "-password -permissions -_id",
          populate: {
            path: "memberId",
            select: "-password -permissions -_id",
          },
        }); await notifyUsersWithPermission(
          { entity: "معرض الصور", action: "update", value: true },
          {
            sender: { id: req?.user.id },
            message: `${updatedAlbum?.name} تم تعديل البوم `,
            action: "update",
            entity: { type: "معرض الصور", id: updatedAlbum?._id },
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
        data: updatedAlbum,
        message: "Album updated successfully",
      });
    }
  );

  deleteImageFromAlbum = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: albumId, imageId } = req.params;

      if (!albumId || !imageId) {
        return next(
          createCustomError(
            "Album ID and Image ID are required",
            HttpCode.BAD_REQUEST
          )
        );
      }

      const updatedAlbum = await Album.findByIdAndUpdate(
        albumId,
        { $pull: { images: imageId } },
        { new: true }
      )
        .populate("images")
        .populate({
          path: "createdBy",
          select: "-password -permissions -_id",
          populate: {
            path: "memberId",
            select: "-password -permissions -_id",
          },
        });
      if (!updatedAlbum) {
        return next(createCustomError("Album not found", HttpCode.NOT_FOUND));
      }

      const deletedImage = await Image.findByIdAndDelete(imageId);

      if (!deletedImage) {
        return next(createCustomError("Image not found", HttpCode.NOT_FOUND));
      }

      await notifyUsersWithPermission(
        { entity: "معرض الصور", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: `${updatedAlbum?.name} تم حذف صورة من البوم `,
          action: "delete",
          entity: { type: "معرض الصور", id: updatedAlbum._id },
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
        message: "Image deleted from album",
        data: updatedAlbum,
      });
    }
  );

  getAlbumStats = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const totalAlbums = await Album.countDocuments();

      const totalImages = await Image.countDocuments();

      const days = parseInt(req.query.days as string) || 7;
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - days);

      const newAlbums = await Album.find({
        createdAt: { $gte: recentDate },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("images")
        .populate({
          path: "createdBy",
          select: "-password -permissions -_id",
          populate: {
            path: "memberId",
            select: "-password -permissions -_id",
          },
        });

      res.status(HttpCode.OK).json({
        success: true,
        data: {
          counts: {
            totalAlbums,
            totalImages,
            newAlbums: newAlbums.length,
          },
          recentAlbums: newAlbums,
          timeframe: `last ${days} days`,
        },
        message: "Album statistics retrieved successfully",
      });
    }
  );
}

export default new AlbumController();
