import { Types } from "mongoose";

export type FamilyBranch =
  | "الفرع الخامس"
  | "الفرع الرابع"
  | "الفرع الثالث"
  | "الفرع الثاني"
  | "الفرع الاول";

export type FamilyRelationship =
  | "ابن"
  | "ابنة"
  | "زوجة"
  | "زوج"
  | "حفيد"
  | "حفيدة"
  |"الجدالأعلى"
  | "أخرى";

export default interface IMember {
  userId?: Types.ObjectId;
  fname: string;
  lname: string;
  gender: "أنثى" | "ذكر";
  familyBranch: FamilyBranch;
  familyRelationship: FamilyRelationship;
  birthday?: Date;
  deathDate?: Date;
  summary?: string;
  husband?: Types.ObjectId; //for female
  wives?: Types.ObjectId[]; //for male
  isUser?: boolean;
  image?: string;
  parents?: {
    father?: Types.ObjectId;
    mother?: Types.ObjectId;
  };
  children?: Types.ObjectId[];
}
