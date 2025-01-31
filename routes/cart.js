const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { protect } = require("../middleware/auth");

// Get user cart
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price brand description images image stock",
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add item to cart
router.post("/add", protect, async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, size }],
      });
    } else {
      // Check if product exists in cart with same size
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId && item.size === size
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, size });
      }

      await cart.save();
    }

    // Populate product details
    cart = await cart.populate({
      path: "items.product",
      select: "name price brand description images image stock",
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update cart item
router.put("/update/:itemId", protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await cart.populate({
      path: "items.product",
      select: "name price brand description images image stock",
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove item from cart
router.delete("/remove/:itemId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    const updatedCart = await cart.populate({
      path: "items.product",
      select: "name price brand description images image stock",
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
