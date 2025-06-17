import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB, PORT } from "./config/db";

const initializeServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    const port = process.env.PORT || PORT;
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`🛠️  Development server running on port ${port}`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1);
  }
};

initializeServer();

export default app;
