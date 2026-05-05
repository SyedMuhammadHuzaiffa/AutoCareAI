const Service = require("../models/Service");
const sendResponse = require("../utils/response");

// Add service
const addService = async (req, res) => {
  try {
    const service = await Service.create({
      userId: req.user.id,
      ...req.body,
    });

    return sendResponse(res, 201, true, "Service added", service);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// Get services
const getServices = async (req, res) => {
  try {
    const services = await Service.find({
      carId: req.params.carId,
      userId: req.user.id,
    });

    return sendResponse(res, 200, true, "Services fetched", services);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ Update Service
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return sendResponse(res, 404, false, "Service not found");
    }

    if (service.userId.toString() !== req.user.id) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return sendResponse(res, 200, true, "Service updated", updatedService);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ Delete Service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return sendResponse(res, 404, false, "Service not found");
    }

    if (service.userId.toString() !== req.user.id) {
      return sendResponse(res, 401, false, "Not authorized");
    }

    await service.deleteOne();

    return sendResponse(res, 200, true, "Service deleted");
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = { 
  addService, 
  getServices, 
  updateService, 
  deleteService 
};