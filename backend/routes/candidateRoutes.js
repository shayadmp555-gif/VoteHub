

const express = require("express");

const {
  getCandidates,
  getAllCandidates,
  addCandidate,
  approveCandidate,
  rejectCandidate,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// ================= GET APPROVED CANDIDATES =================

router.get(
  "/",
  getCandidates
);

// ================= GET ALL CANDIDATES =================
// Admin only

router.get(
  "/all",
  protect,
  admin,
  getAllCandidates
);

// ================= SUBMIT ELECTION PROFILE =================
// Approved candidate can submit own profile

router.post(
  "/",
  protect,
  addCandidate
);

// ================= APPROVE CANDIDATE =================
// Admin only

router.patch(
  "/:id/approve",
  protect,
  admin,
  approveCandidate
);

// ================= REJECT CANDIDATE =================
// Admin only

router.patch(
  "/:id/reject",
  protect,
  admin,
  rejectCandidate
);

// ================= UPDATE CANDIDATE =================
// Admin only

router.put(
  "/:id",
  protect,
  admin,
  updateCandidate
);

// ================= DELETE CANDIDATE =================
// Admin only

router.delete(
  "/:id",
  protect,
  admin,
  deleteCandidate
);

module.exports = router;