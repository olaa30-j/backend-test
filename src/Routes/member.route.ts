import express from "express";
import MemberController from "../controller/member.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("عضو", "create"),
    upload.single("image"),
    MemberController.createMember
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("عضو", "view"),
    MemberController.getAllMembers
  );

router.route("/:id").get(authenticateUser, MemberController.getMemberById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("عضو", "delete"),
    MemberController.deleteMember
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("عضو", "update"),
    upload.single("image"),
    MemberController.updateMember
  );

export default router;
