import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    subCategories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
