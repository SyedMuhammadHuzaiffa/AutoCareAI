const Car = require("../models/Car");
const sendResponse = require("../utils/response");

// Add Car
const addCar = async (req, res) => {
  try {
    const car = await Car.create({
      userId: req.user.id,
      ...req.body,
    });

    return sendResponse(res, 201, true, "Car added", car);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// Get Cars
const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user.id });

    return sendResponse(res, 200, true, "Cars fetched", cars);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ Update Car
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return sendResponse(res, 404, false, "Car not found");
    }

    // 🔐 ownership check
    if (car.userId.toString() !== req.user.id) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return sendResponse(res, 200, true, "Car updated", updatedCar);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ Delete Car
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return sendResponse(res, 404, false, "Car not found");
    }

    if (car.userId.toString() !== req.user.id) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    await car.deleteOne();

    return sendResponse(res, 200, true, "Car deleted");
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = { addCar, getCars, updateCar, deleteCar };
