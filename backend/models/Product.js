import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "SVARNA STUDIO",
    },

    description: {
      type: String,
    },

    shortDescription: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
    },

    category: {
      type: String,
      required: true,
      // Sarees, Kurta Sets, Tops, Co-ord Sets
    },

    subCategory: {
      type: String,
    },

    type: {
      type: String,
      // Short Kurti, Saree, Kurta Set etc.
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    stock: {
      type: Number,
      default: 0,
    },

    // MAIN PRODUCT ATTRIBUTES (PDF based)
    attributes: {
      color: String,
      fabric: String,
      pattern: String,
      fit: String,
      occasion: String,
      length: String,

      neck: String,
      sleeves: String,
      closure: String,
    },

    // SET PRODUCTS (Kurta Set, Co-ord etc.)
    setDetails: {
      top: {
        type: String,
      },
      bottom: {
        type: String,
      },
      dupatta: {
        type: String,
      },
    },

    // SAREE SPECIFIC
    sareeDetails: {
      sareeLength: String,
      blousePiece: String,
      palluDesign: String,
      borderDesign: String,
    },

    // EXTRA FEATURES (like mirror work, embroidery etc.)
    features: [String],

    // STYLE TIP (Important from PDF)
    styleTip: {
      type: String,
    },

    tags: [String],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
