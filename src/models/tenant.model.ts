import { Schema, model } from "mongoose";
import ITenant from "../Interfaces/tenant.interface";

const tenantSchema = new Schema<ITenant>(
  {
    familyName: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
  },
  { timestamps: true, versionKey: false }
);

const Tenant = model<ITenant>("tenant", tenantSchema);

export default Tenant;
