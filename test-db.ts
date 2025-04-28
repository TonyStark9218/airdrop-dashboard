import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();