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

router.get("/", getCandidates);

router.get("/all", protect, admin, getAllCandidates);

router.post("/", protect, admin, addCandidate);

router.patch("/:id/approve", protect, admin, approveCandidate);

router.patch("/:id/reject", protect, admin, rejectCandidate);

router.put("/:id", protect, admin, updateCandidate);

router.delete("/:id", protect, admin, deleteCandidate);

module.exports = router;