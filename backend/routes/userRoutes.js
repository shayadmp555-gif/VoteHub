const express = require("express");

const {
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Only admin can see users
router.get(
  "/",
  protect,
  admin,
  getAllUsers
);

// Only admin can approve user
router.patch(
  "/:id/approve",
  protect,
  admin,
  approveUser
);

// Only admin can reject user
router.patch(
  "/:id/reject",
  protect,
  admin,
  rejectUser
);

// Only admin can permanently delete user
router.delete(
  "/:id",
  protect,
  admin,
  deleteUser
);

module.exports = router;