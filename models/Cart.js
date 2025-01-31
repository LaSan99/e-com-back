const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate total
cartSchema.pre("save", async function (next) {
  if (this.items && this.items.length > 0) {
    // Populate product details to get prices
    await this.populate("items.product");

    // Calculate total
    this.total = this.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  } else {
    this.total = 0;
  }
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
