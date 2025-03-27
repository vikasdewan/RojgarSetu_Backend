const twilio = require("twilio")
const User = require("../models/user.model")

// Create Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Save OTP to user document
const saveOTP = async (userId, otp) => {
  try {
    // OTP expires in 10 minutes
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    await User.findByIdAndUpdate(userId, {
      otp: {
        code: otp,
        expiresAt,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving OTP:", error)
    return false
  }
}

// Send OTP via SMS
const sendOTPBySMS = async (phone, otp) => {
  try {
    // Format phone number (add country code if not present)
    let formattedPhone = phone
    if (!phone.startsWith("+")) {
      formattedPhone = `+91${phone}` // Assuming India (+91) as default, adjust as needed
    }

    // Send SMS using Twilio
    await twilioClient.messages.create({
      body: `Your verification code for Gig Worker App is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    return true
  } catch (error) {
    console.error("Error sending OTP SMS:", error)
    return false
  }
}

// Verify OTP
const verifyOTP = async (userId, otpToVerify) => {
  try {
    const user = await User.findById(userId)

    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (!user.otp || !user.otp.code) {
      return { success: false, message: "No OTP found for this user" }
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return { success: false, message: "OTP has expired" }
    }

    if (user.otp.code !== otpToVerify) {
      return { success: false, message: "Invalid OTP" }
    }

    // OTP is valid, mark user as verified
    user.otpVerified = true
    user.otp = undefined // Clear OTP after successful verification
    await user.save()

    return { success: true, message: "OTP verified successfully" }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return { success: false, message: "Server error" }
  }
}

// Generate and send OTP
const generateAndSendOTP = async (userId) => {
  try {
    // Get user phone number
    const user = await User.findById(userId)
    if (!user) {
      return { success: false, message: "User not found" }
    }

    const otp = generateOTP()
    const saved = await saveOTP(userId, otp)

    if (!saved) {
      return { success: false, message: "Failed to save OTP" }
    }

    const sent = await sendOTPBySMS(user.phone, otp)

    if (!sent) {
      return { success: false, message: "Failed to send OTP SMS" }
    }

    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error("Error generating and sending OTP:", error)
    return { success: false, message: "Server error" }
  }
}

module.exports = {
  generateOTP,
  saveOTP,
  sendOTPBySMS,
  verifyOTP,
  generateAndSendOTP,
}

