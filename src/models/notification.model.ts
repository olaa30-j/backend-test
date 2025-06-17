import mongoose, { Schema, model, Types } from "mongoose";
import { INotification } from "../Interfaces/notification.interface";

const NotificationSchema = new Schema<INotification>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "view",
        "approve",
        "reject",
        "reminder",
      ],
    },
    entity: {
      type: {
        type: String,
        required: true,
        enum: ["مناسبه", "عضو", "اعلان", "ماليه", "معرض الصور", "مستخدم"],
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "entity.type",
      },
    },
    sender: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "users",
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      deepLink: { type: String },
      customData: { type: Schema.Types.Mixed },
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },
    show: {
      type: Boolean,
      default: false,
    },
    isMobileDelivered: { type: Boolean, default: false },
    isEmailDelivered: { type: Boolean, default: false },
    isWebDelivered: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

NotificationSchema.index({ recipientId: 1, read: 1 });
NotificationSchema.index({ "entity.type": 1, "entity.id": 1 });

const Notification = model<INotification>("notification", NotificationSchema);

export default Notification;
