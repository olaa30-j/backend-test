import { Schema, model, Types } from "mongoose";
import IMember from "../Interfaces/member.interface";

const memberSchema = new Schema<IMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    fname: {
      type: String,
      required: [true, "Last name is required"],
    },
    lname: {
      type: String,
      required: [true, "First name is required"],
    },
    gender: {
      type: String,
      enum: ["ذكر", "أنثى"],
      required: [true, "Gender is required"],
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
      required: [true, "Family Branch is required"],
    },
    familyRelationship: {
      type: String,
      enum: {
        values: ["ابن", "ابنة", "زوجة", "زوج", "حفيد", "أخرى", "حفيدة"],
        message: "{VALUE} غير مدعوم",
      },
      required: [true, "Family Relationship is required"],
    },
    birthday: {
      type: Date,
    },
    deathDate: {
      type: Date,
    },
    summary: {
      type: String,
    },
    husband: { type: Schema.Types.ObjectId, ref: "members", default: null },
    wives: [{ type: Schema.Types.ObjectId, ref: "members" }],
    isUser: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "avatar.jfif",
    },
    parents: {
      father: { type: Schema.Types.ObjectId, ref: "members" },
      mother: { type: Schema.Types.ObjectId, ref: "members" },
    },
    children: [{ type: Schema.Types.ObjectId, ref: "members" }],
  },
  { timestamps: true, versionKey: false }
);

const Member = model<IMember>("members", memberSchema);

export default Member;
