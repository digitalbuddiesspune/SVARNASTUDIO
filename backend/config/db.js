import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn(
      "MONGODB_URI (or MONGO_URI) is not set. Running without database connection."
    );
    return false;
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
  return true;
};

export default connectDB;
