import express from "express"
import { auth, isOwner, isProfileComplete } from "../middleware/auth.middleware.js"
import { getDashboard, applyForVehicleForm, addVehicle, removeVehicle } from "../controllers/owner.controller.js"
import { uploadVehicleImage } from "../utils/cloudinary.util.js"

const router = express.Router()

// All owner routes are protected
router.use(auth, isOwner)

// Get owner dashboard
router.get("/dashboard", getDashboard)

// Apply for a vehicle/instrument form (requires 90% profile completion)
router.post("/vehicle/:vehicleFormId/apply", isProfileComplete, applyForVehicleForm)

// Add vehicle to owner's profile
router.post("/vehicle", uploadVehicleImage.single("image"), addVehicle)

// Remove vehicle from owner's profile
router.delete("/vehicle/:vehicleId", removeVehicle)

export default router

