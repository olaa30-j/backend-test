import express from "express";
import AdvertisementController from "../controller/advertisement.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/stats")
  .get(authenticateUser, AdvertisementController.getAdvertisementStats);

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("اعلان", "create"),
    upload.single("image"),
    AdvertisementController.createAdvertisement
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("اعلان", "view"),
    AdvertisementController.getAllAdvertisements
  );

router
  .route("/")
  .delete(
    authenticateUser,
    authorizePermission("اعلان", "delete"),
    AdvertisementController.deleteAllAdvertisements
  );

router
  .route("/:id")
  .get(authenticateUser, AdvertisementController.getAdvertisementById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("اعلان", "delete"),
    AdvertisementController.deleteAdvertisementById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("اعلان", "update"),
    upload.single("image"),
    AdvertisementController.updateAdvertisementById
  );

export default router;
