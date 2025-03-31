import { Owner, VehicleForm, VehicleApplication } from "../models/index.js"
import { createNotification } from "../utils/notification.util.js"
import { recommendVehicleFormsForOwner } from "../utils/recommendation.util.js"

// Get owner dashboard data
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.profileId

    // Get all vehicle applications for this owner
    const vehicleApplications = await VehicleApplication.find({
      applicantId: ownerId,
      applicantModel: "Owner",
    })
      .populate({
        path: "vehicleFormId",
        select: "title type payscale location organization",
        populate: {
          path: "contractorId",
          select: "name organizationName",
        },
      })
      .sort({ appliedAt: -1 })

    // Get recommended vehicle forms
    const { recommendations } = await recommendVehicleFormsForOwner(ownerId)

    res.json({
      vehicleApplications,
      recommendedForms: recommendations || [],
    })
  } catch (error) {
    console.error("Get owner dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Apply for a vehicle/instrument form
const applyForVehicleForm = async (req, res) => {
  try {
    const { vehicleFormId } = req.params
    const { type, brand, quantity, purchaseDate, location, ownerDetails } = req.body
    const ownerId = req.profileId

    // Check if vehicle form exists
    const vehicleForm = await VehicleForm.findById(vehicleFormId)
    if (!vehicleForm) {
      return res.status(404).json({ message: "Vehicle form not found" })
    }

    // Check if owner has already applied
    const existingApplication = await VehicleApplication.findOne({
      applicantId: ownerId,
      applicantModel: "Owner",
      vehicleFormId,
    })

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this vehicle form" })
    }

    // Create vehicle application
    const application = new VehicleApplication({
      applicantId: ownerId,
      applicantModel: "Owner",
      vehicleFormId,
      type: type || vehicleForm.type,
      brand,
      quantity,
      purchaseDate,
      location: location || vehicleForm.location,
      ownerDetails,
    })

    // Save application
    await application.save()

    // Update vehicle form with application
    vehicleForm.applications.push(application._id)
    await vehicleForm.save()

    // Create notification for contractor
    await createNotification(
      vehicleForm.contractorId,
      "Contractor",
      `New vehicle application received for ${vehicleForm.title}`,
      "vehicle",
      application._id,
    )

    res.status(201).json({
      message: "Vehicle application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Vehicle application error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add vehicle to owner's profile
const addVehicle = async (req, res) => {
  try {
    const { vehicleName, model, capacity } = req.body
    const ownerId = req.profileId

    // Get owner profile
    const owner = await Owner.findById(ownerId)
    if (!owner) {
      return res.status(404).json({ message: "Owner profile not found" })
    }

    // Add vehicle to owner's available vehicles
    owner.availableVehicles.push({
      vehicleName,
      model,
      capacity,
      image: req.file ? req.file.path : null,
    })

    // Recalculate profile completion
    const totalFields = 8 // name, phone, email, organization, location, role, availableVehicles, otpVerified
    let completedFields = 0
    ;["name", "phone", "email", "organization", "location", "role", "otpVerified"].forEach((field) => {
      if (owner[field] !== undefined && owner[field] !== null && owner[field] !== "") {
        completedFields++
      }
    })

    if (owner.availableVehicles && owner.availableVehicles.length > 0) {
      completedFields++
    }

    owner.profileCompletion = Math.round((completedFields / totalFields) * 100)

    // Save owner profile
    await owner.save()

    res.json({
      message: "Vehicle added successfully",
      vehicle: owner.availableVehicles[owner.availableVehicles.length - 1],
      profileCompletion: owner.profileCompletion,
    })
  } catch (error) {
    console.error("Add vehicle error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Remove vehicle from owner's profile
const removeVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params
    const ownerId = req.profileId

    // Get owner profile
    const owner = await Owner.findById(ownerId)
    if (!owner) {
      return res.status(404).json({ message: "Owner profile not found" })
    }

    // Remove vehicle from owner's available vehicles
    owner.availableVehicles = owner.availableVehicles.filter((vehicle) => vehicle._id.toString() !== vehicleId)

    // Recalculate profile completion
    const totalFields = 8 // name, phone, email, organization, location, role, availableVehicles, otpVerified
    let completedFields = 0
    ;["name", "phone", "email", "organization", "location", "role", "otpVerified"].forEach((field) => {
      if (owner[field] !== undefined && owner[field] !== null && owner[field] !== "") {
        completedFields++
      }
    })

    if (owner.availableVehicles && owner.availableVehicles.length > 0) {
      completedFields++
    }

    owner.profileCompletion = Math.round((completedFields / totalFields) * 100)

    // Save owner profile
    await owner.save()

    res.json({
      message: "Vehicle removed successfully",
      profileCompletion: owner.profileCompletion,
    })
  } catch (error) {
    console.error("Remove vehicle error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export { getDashboard, applyForVehicleForm, addVehicle, removeVehicle }

