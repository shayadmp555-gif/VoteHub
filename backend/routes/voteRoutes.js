const express = require("express");
const router = express.Router();

const {
  castVote,
  getResults
} = require("../controllers/voteController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// User voting
router.post("/", protect, castVote);

// Results ONLY for Admin
router.get("/results", protect, adminOnly, getResults);

module.exports = router;