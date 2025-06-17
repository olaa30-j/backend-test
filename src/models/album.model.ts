import mongoose, { Schema, Document } from "mongoose";
import IAlbum from "../Interfaces/album.interface";

const albumSchema = new Schema<IAlbum>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: "image",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IAlbum>("album", albumSchema);
