import express from "express";
import TransactionController from "../controller/financial.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("ماليه", "create"),
    upload.single("image"),
    TransactionController.createTransaction
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("ماليه", "view"),
    TransactionController.getAllTransactions
  );

router
  .route("/")
  .delete(
    authenticateUser,
    authorizePermission("ماليه", "delete"),
    TransactionController.deleteAllTransactions
  );

router
  .route("/:id")
  .get(authenticateUser, TransactionController.getTransactionById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("ماليه", "delete"),
    TransactionController.deleteTransactionById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("ماليه", "update"),
    upload.single("image"),
    TransactionController.updateTransactionById
  );

export default router;
