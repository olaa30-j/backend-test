import { Types } from "mongoose";
export default interface IAdvertisement {
  userId: Types.ObjectId;
  title: string;
  type: string;
  content: string;
  image?: string;
  status?: string;
}
