const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size: [
      {
        type: Number,
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
