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

// ================= GET ALL USERS =================
// Admin only

router.get(
  "/",
  protect,
  admin,
  getAllUsers
);

// ================= APPROVE USER =================

router.patch(
  "/:id/approve",
  protect,
  admin,
  approveUser
);

// ================= REJECT USER =================

router.patch(
  "/:id/reject",
  protect,
  admin,
  rejectUser
);

// ================= DELETE USER =================

router.delete(
  "/:id",
  protect,
  admin,
  deleteUser
);

module.exports = router;