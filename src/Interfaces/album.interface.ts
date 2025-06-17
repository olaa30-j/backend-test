import mongoose from "mongoose";
import Image from "./image.interface";
export default interface IAlbum {
  name: string;
  description: string;
  images: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}
