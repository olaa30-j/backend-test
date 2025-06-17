import mongoose, { Schema, Document } from "mongoose";
import IImage from "../Interfaces/image.interface";

const imageSchema = new Schema<IImage>(
  {
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IImage>("image", imageSchema);
