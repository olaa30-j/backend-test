import multer, { FileFilterCallback } from "multer";
import express, { NextFunction, Request } from "express";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../services/cloudinary.service";

const route = express.Router();
route.use(express.static("public/uploads"));

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

// Test the configuration
cloudinary.api
  .ping()
  .then(() => {
    console.log("Cloudinary is configured correctly");
  })
  .catch((err) => {
    console.error("Error configuring Cloudinary:", err);
  });

// Create store from Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});

const multerFilter = function (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const acceptedMimetypes = ["image/jpeg", "image/png", "image/gif"];
  if (acceptedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    throw new Error("Not an accepted image format");
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});
