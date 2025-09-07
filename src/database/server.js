// server.js
import mongoose from "mongoose";
import { DATABASE_NAME } from "../constant.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL+DATABASE_NAME);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Stop the app if DB fails
  }
};
