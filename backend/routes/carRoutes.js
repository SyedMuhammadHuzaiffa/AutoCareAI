const express = require("express");
const router = express.Router();

const {
  addCar,
  getCars,
  updateCar,
  deleteCar,
} = require("../controllers/carController");
const { protect } = require("../middleware/authMiddleware");

// 🚗 user-only cars
router.post("/", protect, addCar);
router.get("/", protect, getCars);

// ✅ NEW
router.put("/:id", protect, updateCar);
router.delete("/:id", protect, deleteCar);

module.exports = router;
