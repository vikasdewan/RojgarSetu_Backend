import express from "express"
import { VehicleForm } from "../models/index.js"

const router = express.Router()

// Get all vehicle forms (public route)
router.get("/", async (req, res) => {
  try {
    const { location, type, minSalary, maxSalary } = req.query

    // Build filter object
    const filter = {}

    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    if (type) {
      filter.type = type
    }

    if (minSalary) {
      filter.payscale = { ...filter.payscale, $gte: Number(minSalary) }
    }

    if (maxSalary) {
      filter.payscale = { ...filter.payscale, $lte: Number(maxSalary) }
    }

    // Get vehicle forms with pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const vehicleForms = await VehicleForm.find(filter)
      .populate("contractorId", "name organizationName rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await VehicleForm.countDocuments(filter)

    res.json({
      vehicleForms,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get vehicle forms error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get vehicle form by ID (public route)
router.get("/:id", async (req, res) => {
  try {
    const vehicleForm = await VehicleForm.findById(req.params.id).populate(
      "contractorId",
      "name organizationName rating",
    )

    if (!vehicleForm) {
      return res.status(404).json({ message: "Vehicle form not found" })
    }

    res.json({ vehicleForm })
  } catch (error) {
    console.error("Get vehicle form error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

export default router

