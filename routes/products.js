const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, manager } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");

// Get all products
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create product with multiple image upload (Manager only)
router.post(
  "/",
  protect,
  manager,
  upload.array("images", 5),
  async (req, res) => {
    try {
      // Log the request for debugging
      console.log('Request body:', req.body);
      console.log('Files:', req.files);

      const imageUrls = req.files?.map((file) => `/uploads/${file.filename}`) || [];

      const productData = {
        name: req.body.name,
        brand: req.body.brand,
        description: req.body.description,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        category: req.body.category,
        images: imageUrls,
        size: req.body.size
          .split(",")
          .map(Number)
          .filter((size) => !isNaN(size)),
      };

      const product = await Product.create(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
);

// Update product with multiple image upload (Manager only)
router.put(
  "/:id",
  protect,
  manager,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map(
          (file) => `/uploads/${file.filename}`
        );

        // If keepExistingImages is true, append new images to existing ones
        if (req.body.keepExistingImages === "true") {
          const existingProduct = await Product.findById(req.params.id);
          updateData.images = [
            ...(existingProduct.images || []),
            ...newImageUrls,
          ];
        } else {
          updateData.images = newImageUrls;
        }
      }

      if (req.body.size) {
        updateData.size = req.body.size
          .split(",")
          .map(Number)
          .filter((size) => !isNaN(size));
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
        }
      );

      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
);

// Delete product (Manager only)
router.delete("/:id", protect, manager, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
