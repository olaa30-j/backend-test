import mongoose, { Schema } from "mongoose";

export const actionPermissionSchema = new Schema(
  {
    entity: {
      type: String,
      required: true,
      enum: ["مناسبه", "عضو", "مستخدم", "معرض الصور", "ماليه", "اعلان"],
    },
    view: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
  },
  { _id: false }
);

export const permissionSchema = new Schema(
  {
    role: { type: String },
    permissions: [actionPermissionSchema],
  },
  { timestamps: true }
);

const Permission = mongoose.model("permission", permissionSchema);

export default Permission;

export const defaultPermissions = [
  {
    entity: "مناسبه",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "عضو",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "مستخدم",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "معرض الصور",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "ماليه",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
  {
    entity: "اعلان",
    view: false,
    update: false,
    delete: false,
    create: false,
  },
];
