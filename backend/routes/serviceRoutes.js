const express = require("express");
const router = express.Router();

const {
  addService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");

// 🔐 protected routes
router.post("/", protect, addService);
router.get("/:carId", protect, getServices);

// ✅ NEW
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;
