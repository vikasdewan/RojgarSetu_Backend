import express from "express"
import { auth, isContractor, isProfileComplete } from "../middleware/auth.middleware.js"
import {
  createJobPost,
  updateJobPost,
  deleteJobPost,
  viewJob,
  viewAllJobs,
  createVehicleForm,
  updateVehicleForm,
  deleteVehicleForm,
  viewVehicle,
  viewAllVehicles,
  getDashboard,
  viewAllApplications,
  viewJobApplications,
  viewVehicleApplications,
  processJobApplication,
  sendJoiningLetter,
  processVehicleApplication,
  sendInvitation,
} from "../controllers/contractor.controller.js"

const router = express.Router()

// All contractor routes are protected
router.use(auth, isContractor)

// Dashboard
router.get("/dashboard", getDashboard)

// Job posting routes
router.get("/jobs", viewAllJobs)
router.get("/job/:id", viewJob)
router.post("/job", isProfileComplete, createJobPost)
router.put("/job/:id", isProfileComplete, updateJobPost)
router.delete("/job/:id", deleteJobPost)

// Vehicle/instrument form routes
router.get("/vehicles", viewAllVehicles)
router.get("/vehicle/:id", viewVehicle)
router.post("/vehicle", isProfileComplete, createVehicleForm)
router.put("/vehicle/:id", isProfileComplete, updateVehicleForm)
router.delete("/vehicle/:id", deleteVehicleForm)

// Application routes
router.get("/applications", viewAllApplications)
router.get("/job/:jobId/applications", viewJobApplications)
router.get("/vehicle/:vehicleId/applications", viewVehicleApplications)

// Job application processing
router.put("/application/:applicationId/process", processJobApplication)
router.post("/application/:applicationId/joining-letter", sendJoiningLetter)

// Vehicle application processing
router.put("/vehicle-application/:applicationId/process", processVehicleApplication)

// Send invitation
router.post("/invite", sendInvitation)

export default router

