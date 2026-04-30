import mongoose from "mongoose";

const designDetailsSchema = new mongoose.Schema(
  {
    kurta_design: [String],
    bottom_design: [String],
    dupatta_design: [String],

    top_design: [String],
    shrug_design: [String],

    saree_design: [String],
    pallu_design: [String],
    blouse_design: [String],
  },
  { _id: false }
);

const priceSchema = new mongoose.Schema(
  {
    mrp: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountedPrice: {
      type: Number,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subCategory: {
      type: String,
      required: true,
      trim: true,
    },

    type: String,

    color: String,

    pattern: String,

    fabric: String,

    fit: String,

    occasion: String,

    length: String,

    kurtaLength: String,

    sareeLength: String,

    sleeves: String,

    neck: String,

    closure: String,

    backDesign: String,

    bottom: String,

    dupatta: String,

    blousePiece: String,

    texture: String,

    finish: String,

    details: String,

    availableColors: [String],

    design_details: designDetailsSchema,

    price: priceSchema,

    styleTip: String,

    description: String,

    productImages: [String],

    stock: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrendingNow: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function () {
  if (this.price && this.price.mrp) {
    const discount = this.price.discountPercent || 0;
    this.price.discountedPrice = this.price.mrp - (this.price.mrp * discount) / 100;
  }
});

productSchema.index({ category: 1, subCategory: 1 });

export default mongoose.model("Product", productSchema);
