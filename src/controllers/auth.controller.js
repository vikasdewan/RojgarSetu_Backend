import { User, Worker, Contractor, Owner } from "../models/index.js"
import { generateAndSendOTP, verifyOTP } from "../utils/otp.util.js"

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create profile based on user type
    let profile

    if (userType === "Worker") {
      profile = new Worker({ name, email, phone })
    } else if (userType === "Contractor") {
      profile = new Contractor({ name, email, phone })
    } else if (userType === "Owner") {
      profile = new Owner({ name, email, phone })
    } else {
      return res.status(400).json({ message: "Invalid user type" })
    }

    // Save profile
    await profile.save()

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password,
      userType,
      profileId: profile._id,
    })

    // Save user
    await user.save()

    // Generate and send OTP
    const otpResult = await generateAndSendOTP(user._id)

    if (!otpResult.success) {
      return res.status(500).json({ message: otpResult.message })
    }

    // Generate token
    const token = user.generateAuthToken()

    // Return user data and token
    res.status(201).json({
      message: "User registered successfully. Please verify your account with the OTP sent to your phone.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profileId: user.profileId,
        otpVerified: user.otpVerified,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = user.generateAuthToken()

    // Return user data and token
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profileId: user.profileId,
        otpVerified: user.otpVerified,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Verify OTP
const verifyUserOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" })
    }

    const result = await verifyOTP(userId, otp)

    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    // Update profile's otpVerified status
    const user = await User.findById(userId)

    if (user) {
      if (user.userType === "Worker") {
        await Worker.findByIdAndUpdate(user.profileId, { otpVerified: true })
      } else if (user.userType === "Contractor") {
        await Contractor.findByIdAndUpdate(user.profileId, { otpVerified: true })
      } else if (user.userType === "Owner") {
        await Owner.findByIdAndUpdate(user.profileId, { otpVerified: true })
      }
    }

    res.json({ message: "OTP verified successfully" })
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    // Generate and send new OTP
    const otpResult = await generateAndSendOTP(userId)

    if (!otpResult.success) {
      return res.status(500).json({ message: otpResult.message })
    }

    res.json({ message: "OTP sent successfully to your phone" })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get profile data based on user type
    let profile

    if (user.userType === "Worker") {
      profile = await Worker.findById(user.profileId)
    } else if (user.userType === "Contractor") {
      profile = await Contractor.findById(user.profileId)
    } else if (user.userType === "Owner") {
      profile = await Owner.findById(user.profileId)
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        profileId: user.profileId,
        otpVerified: user.otpVerified,
      },
      profile,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export { register, login, verifyUserOTP, resendOTP, getCurrentUser }

