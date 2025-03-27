const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth.middleware")
const { register, login, verifyUserOTP, resendOTP, getCurrentUser } = require("../controllers/auth.controller")

// Register a new user
router.post("/register", register)

// Login user
router.post("/login", login)

// Verify OTP
router.post("/verify-otp", verifyUserOTP)

// Resend OTP
router.post("/resend-otp", resendOTP)

// Get current user (protected route)
router.get("/me", auth, getCurrentUser)

module.exports = router
