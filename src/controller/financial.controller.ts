import { Request, Response, NextFunction } from "express";
import Transaction from "../models/financial.model";
import asyncWrapper from "../middlewares/asynHandler";
import { createCustomError, HttpCode } from "../errors/customError";
import mongoose from "mongoose";
import { notifyUsersWithPermission } from "../utils/notify";

class TransactionController {
  createTransaction = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { name, amount, type, date, description, category } = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return next(createCustomError("Unauthorized", HttpCode.UNAUTHORIZED));
      }

      if (!name || !amount || !type || !category || !date) {
        return next(
          createCustomError("Missing required fields", HttpCode.BAD_REQUEST)
        );
      }
      let image;
      if (req.file?.path) {
        image = req.file.path.replace(/\\/g, "/");
      }

      const transaction = await Transaction.create({
        name,
        amount: parseFloat(amount),
        type,
        date,
        image,
        description,
        category,
        createdBy: userId,
      });

      await notifyUsersWithPermission(
        { entity: "ماليه", action: "view", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم إنشاء تقرير مالي جديد",
          action: "create",
          entity: { type: "ماليه", id: transaction?._id },
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
        data: transaction,
        message: "Transaction created successfully",
      });
    }
  );

  getAllTransactions = asyncWrapper(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalTransactions = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .populate("createdBy", "-password")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalTransactions / limit);

    res.status(HttpCode.OK).json({
      success: true,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: page,
        pageSize: transactions.length,
      },
      data: transactions,
      message: "Fetched all transactions successfully",
    });
  });

  getTransactionById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const transactionId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return next(
          createCustomError("Invalid transaction ID", HttpCode.BAD_REQUEST)
        );
      }

      const transaction = await Transaction.findById(transactionId).populate(
        "createdBy",
        "-password"
      );

      if (!transaction) {
        return next(
          createCustomError("Transaction not found", HttpCode.NOT_FOUND)
        );
      }

      res.status(HttpCode.OK).json({
        success: true,
        data: transaction,
        message: "Fetched transaction successfully",
      });
    }
  );

  deleteTransactionById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const transactionId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return next(
          createCustomError("Invalid transaction ID", HttpCode.BAD_REQUEST)
        );
      }

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return next(
          createCustomError("Transaction not found", HttpCode.NOT_FOUND)
        );
      }

      await transaction.deleteOne();

      res.status(HttpCode.OK).json({
        success: true,
        data: null,
        message: "Transaction deleted successfully",
      });
    }
  );

  updateTransactionById = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const transactionId = req.params.id;
      let updateData = req.body;
      if (req.file?.path) {
        updateData.image = req.file.path.replace(/\\/g, "/");
      }

      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
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

      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return next(
          createCustomError("Invalid transaction ID", HttpCode.BAD_REQUEST)
        );
      }

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        return next(
          createCustomError("Transaction not found", HttpCode.NOT_FOUND)
        );
      }

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        { _id: transactionId },
        updateData,
        { new: true }
      );

      await notifyUsersWithPermission(
          { entity: "ماليه", action: "update", value: true },
          {
            sender: { id: req?.user.id },
            message: "تم تعديل تقرير مالي",
            action: "update",
            entity: { type: "ماليه", id: updatedTransaction?._id },
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
        data: updatedTransaction,
        message: "Transaction updated successfully",
      });
    }
  );

  deleteAllTransactions = asyncWrapper(
    async (req: Request, res: Response, next: NextFunction) => {
      const { confirm } = req.body;

      if (confirm !== "true") {
        return next(
          createCustomError(
            "Confirmation required. Send confirm=true in request body to delete all transactions",
            HttpCode.BAD_REQUEST
          )
        );
      }

      const result = await Transaction.deleteMany();

      await notifyUsersWithPermission(
        { entity: "ماليه", action: "delete", value: true },
        {
          sender: { id: req?.user.id },
          message: "تم حذف تقرير مالي",
          action: "delete",
          entity: { type: "ماليه" },
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
        data: { deletedCount: result.deletedCount },
        message: `All transactions deleted successfully`,
      });
    }
  );
}

export default new TransactionController();
