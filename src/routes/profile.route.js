const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth.middleware")
const { completeProfile, getProfile } = require("../controllers/profile.controller")

// Complete profile (protected route)
router.put("/complete", auth, completeProfile)

// Get profile (protected route)
router.get("/", auth, getProfile)

module.exports = router

