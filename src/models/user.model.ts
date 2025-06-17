import { Schema, model, Types } from "mongoose";
import IUser, { IUserDocument } from "../Interfaces/user.interface";
import { actionPermissionSchema, defaultPermissions } from "./permission.model";
import Member from "./member.model";
import { NextFunction } from "express";

const userSchema = new Schema<IUserDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },
    memberId: { type: Schema.Types.ObjectId, ref: "members", index: true },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      validate: {
        validator: (value: string): boolean => {
          let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return pattern.test(value);
        },
        message: "Please fill a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
    },
    phone: {
      type: Number,
      required: [true, "Please provide phone number"],
    },
    role: {
      type: [String],
      default: ["مستخدم"],
      validate: {
        validator: function (roles: string[]) {
          return roles.length > 0;
        },
        message: "User must have at least one role",
      },
    },
    familyBranch: {
      type: String,
      enum: {
        values: [
          "الفرع الخامس",
          "الفرع الرابع",
          "الفرع الثالث",
          "الفرع الثاني",
          "الفرع الاول",
        ],
        message: "{VALUE} غير مدعوم",
      },
    },
    familyRelationship: {
      type: String,
      enum: {
        values: ["ابن", "ابنة", "زوجة", "زوج", "حفيد", "أخرى"],
        message: "{VALUE} غير مدعوم",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["قيد الانتظار", "مرفوض", "مقبول"],
        message: "{VALUE} غير مدعوم",
      },
      default: "قيد الانتظار",
    },
    address: {
      type: String,
    },
    permissions: {
      type: [actionPermissionSchema],
      default: defaultPermissions,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods = {
  addRole: function (role: string): boolean {
    if (!this.role.includes(role)) {
      this.role.push(role);
      return true;
    }
    return false;
  },

  removeRole: function (role: string): boolean {
    const initialLength = this.role.length;
    this.role = this.role.filter((r: string) => r !== role);

    if (this.role.length === 0) {
      this.role = ["user"];
      return false;
    }

    return this.role.length < initialLength;
  },

  hasRole: function (role: string): boolean {
    return this.role.includes(role);
  },

  hasAnyRole: function (roles: string[]): boolean {
    return this.role.some((userRole: string) => roles.includes(userRole));
  },

  getRoles: function (): string[] {
    return this.role;
  },
};

const User = model<IUserDocument>("users", userSchema);

export default User;
