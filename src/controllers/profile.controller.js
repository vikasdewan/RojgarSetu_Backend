import { Worker, Contractor, Owner } from "../models/index.js"

// Calculate profile completion percentage
const calculateProfileCompletion = (profile, userType) => {
  let totalFields = 0
  let completedFields = 0

  if (userType === "Worker") {
    // Define required fields for Worker
    const fields = [
      "name",
      "email",
      "phone",
      "otpVerified",
      "currentStatus",
      "lookingFor",
      "image",
      "pastExperience",
      "expectedSalary",
      "resume",
    ]

    totalFields = fields.length

    // Count completed fields
    fields.forEach((field) => {
      if (profile[field] !== undefined && profile[field] !== null && profile[field] !== "") {
        completedFields++
      }
    })
  } else if (userType === "Contractor") {
    // Define required fields for Contractor
    const fields = [
      "name",
      "email",
      "phone",
      "image",
      "location",
      "role",
      "workProfile",
      "completedProjects",
      "organizationName",
      "otpVerified",
    ]

    totalFields = fields.length

    // Count completed fields
    fields.forEach((field) => {
      if (field === "completedProjects") {
        if (profile[field] && profile[field].length > 0) {
          completedFields++
        }
      } else if (profile[field] !== undefined && profile[field] !== null && profile[field] !== "") {
        completedFields++
      }
    })
  } else if (userType === "Owner") {
    // Define required fields for Owner
    const fields = ["name", "phone", "email", "organization", "location", "role", "availableVehicles", "otpVerified"]

    totalFields = fields.length

    // Count completed fields
    fields.forEach((field) => {
      if (field === "availableVehicles") {
        if (profile[field] && profile[field].length > 0) {
          completedFields++
        }
      } else if (profile[field] !== undefined && profile[field] !== null && profile[field] !== "") {
        completedFields++
      }
    })
  }

  // Calculate percentage
  return Math.round((completedFields / totalFields) * 100)
}

// Complete profile
const completeProfile = async (req, res) => {
  try {
    const { userId, userType } = req
    const profileData = req.body

    let profile

    // Get and update profile based on user type
    if (userType === "Worker") {
      profile = await Worker.findByIdAndUpdate(req.profileId, { ...profileData }, { new: true, runValidators: true })
    } else if (userType === "Contractor") {
      profile = await Contractor.findByIdAndUpdate(
        req.profileId,
        { ...profileData },
        { new: true, runValidators: true },
      )
    } else if (userType === "Owner") {
      profile = await Owner.findByIdAndUpdate(req.profileId, { ...profileData }, { new: true, runValidators: true })
    } else {
      return res.status(400).json({ message: "Invalid user type" })
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    // Calculate profile completion percentage
    const completionPercentage = calculateProfileCompletion(profile, userType)

    // Update profile completion percentage
    profile.profileCompletion = completionPercentage
    await profile.save()

    // Generate portfolio link for Worker
    if (userType === "Worker") {
      // Simple portfolio link generation
      profile.portfolio = `${process.env.FRONTEND_URL}/worker/${profile._id}`
      await profile.save()
    }

    res.json({
      message: "Profile updated successfully",
      profile,
      completionPercentage,
    })
  } catch (error) {
    console.error("Profile completion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get profile
const getProfile = async (req, res) => {
  try {
    const { userType, profileId } = req

    let profile

    // Get profile based on user type
    if (userType === "Worker") {
      profile = await Worker.findById(profileId)
    } else if (userType === "Contractor") {
      profile = await Contractor.findById(profileId)
    } else if (userType === "Owner") {
      profile = await Owner.findById(profileId)
    } else {
      return res.status(400).json({ message: "Invalid user type" })
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    res.json({ profile })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export { completeProfile, getProfile, calculateProfileCompletion }

