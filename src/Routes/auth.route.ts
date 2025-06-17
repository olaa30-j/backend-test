import express from "express";
import AuthController from "../controller/auth.controller";
import { upload } from "../middlewares/uploadImage";
import { authenticateUser } from "../middlewares/auth";
const router = express.Router();

router.route("/register").post(upload.single("image"), AuthController.register);

router.route("/login").post(AuthController.login);

router.route("/logout").post(AuthController.logout);

router.route("/forgot-password").post(AuthController.forgotPassword);

router.route("/reset-password/:token").post(AuthController.resetPassword);

router.patch(
  "/change-password",
  authenticateUser,
  AuthController.changePassword
);

export default router;
