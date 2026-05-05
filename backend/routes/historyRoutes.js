const express = require("express");
const router = express.Router();

const { getHistory } = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

// 🔐 user-specific history
router.get("/:carId", protect, getHistory);

module.exports = router;
