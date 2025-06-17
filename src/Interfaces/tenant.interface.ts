import { Types } from "mongoose";

export default interface ITenant {
  familyName: string;
  slug: string;
  subscriptionPlan: string;
}
