import { Types } from "mongoose";

export default interface IEvent {
  userId: Types.ObjectId;
  address: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status?: string;
}
