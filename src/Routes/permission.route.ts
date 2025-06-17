import express from "express";
import {
  authenticateUser,
  authorizePermissionFromBody,
} from "../middlewares/auth";
import PermissionsController from "../controller/permission.controller";
const router = express.Router();

router
  .route("/check")
  .post(
    authenticateUser,
    authorizePermissionFromBody(),
    PermissionsController.checkPermission
  );
router.route("/roles").get(authenticateUser, PermissionsController.getAllRoles);

router
  .route("/")
  .post(authenticateUser, PermissionsController.createPermission);

router
  .route("/")
  .get(authenticateUser, PermissionsController.getAllPermissions);

router
  .route("/:role")
  .delete(authenticateUser, PermissionsController.deleteRoleAndUpdateUsers);

router
  .route("/:role")
  .patch(authenticateUser, PermissionsController.updatePermissionForRole);

export default router;
