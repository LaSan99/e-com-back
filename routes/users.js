const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, manager } = require("../middleware/auth");

// @desc    Get all users (managers only)
// @route   GET /api/users
// @access  Private/Manager
router.get("/", protect, manager, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Manager
router.put("/:id", protect, manager, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Manager
router.delete("/:id", protect, manager, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the last manager
    if (user.role === "manager") {
      const managerCount = await User.countDocuments({ role: "manager" });
      if (managerCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last manager" });
      }
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
