import express from "express"
import { auth } from "../middlewares/auth.middleware.js"
import { completeProfile, getProfile } from "../controllers/profile.controller.js"

const router = express.Router()

// Complete profile (protected route)
router.put("/complete", auth, completeProfile)

// Get profile (protected route)
router.get("/", auth, getProfile)

export default router

