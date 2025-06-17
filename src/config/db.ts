import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5001;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("db connected");
  } catch (err: any) {
    console.log("An disconnected error occur", err);
    process.exit(1);
  }
};

export { connectDB, PORT };
