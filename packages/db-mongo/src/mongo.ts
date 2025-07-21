import mongoose from "mongoose";

let isConnected = false;

export const connectMongo = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable not set.");
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: "rankmarg",
    });
    isConnected = true;
    console.log("✅ MongoDB connected.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};
