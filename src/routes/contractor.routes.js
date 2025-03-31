import express from "express"
import { auth, isContractor, isProfileComplete } from "../middlewares/auth.middleware.js"
import {
  createJobPost,
  updateJobPost,
  deleteJobPost,
  createVehicleForm,
  updateVehicleForm,
  deleteVehicleForm,
  getDashboard,
  processJobApplication,
  sendJoiningLetter,
  processVehicleApplication,
  sendInvitation,
} from "../controllers/contractor.controller.js"

const router = express.Router()

// All contractor routes are protected
router.use(auth, isContractor)

// Get contractor dashboard
router.get("/dashboard", getDashboard)

// Job posting routes (requires 90% profile completion)
router.post("/job", isProfileComplete, createJobPost)
router.put("/job/:id", isProfileComplete, updateJobPost)
router.delete("/job/:id", deleteJobPost)

// Vehicle/instrument form routes (requires 90% profile completion)
router.post("/vehicle", isProfileComplete, createVehicleForm)
router.put("/vehicle/:id", isProfileComplete, updateVehicleForm)
router.delete("/vehicle/:id", deleteVehicleForm)

// Job application processing
router.put("/application/:applicationId/process", processJobApplication)
router.post("/application/:applicationId/joining-letter", sendJoiningLetter)

// Vehicle application processing
router.put("/vehicle-application/:applicationId/process", processVehicleApplication)

// Send invitation
router.post("/invite", sendInvitation)

export default router

