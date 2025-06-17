import { Schema, model, Types } from "mongoose";
import IEvent from "../Interfaces/event.interface";

const eventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    address: {
      type: String,
      required: [true, "The address is required"],
    },
    description: {
      type: String,
      required: [true, "The description is required"],
    },
    location: {
      type: String,
      required: [true, "The event Location is required"],
    },
    startDate: {
      type: Date,
      required: [true, "The start Date is required"],
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "reject", "accept"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

const Event = model<IEvent>("events", eventSchema);

export default Event;
