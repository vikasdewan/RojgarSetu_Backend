import { Contractor, JobPost, JobApplication, VehicleForm, VehicleApplication, Worker, Owner } from "../models/index.js"
import { createNotification } from "../utils/notification.util.js"
import { generateOfferLetter, generateJoiningLetter } from "../utils/pdf.util.js"
import { recommendWorkersForJob } from "../utils/recommendation.util.js"

// Create a job posting
const createJobPost = async (req, res) => {
  try {
    const { title, payscale, requiredSkill, experienceRequired, noOfWorkers, duration, location, description } =
      req.body

    const contractorId = req.profileId

    // Create job post
    const jobPost = new JobPost({
      contractorId,
      title,
      payscale,
      requiredSkill,
      experienceRequired,
      noOfWorkers,
      duration,
      location,
      description,
    })

    // Save job post
    await jobPost.save()

    // Update contractor with job post
    await Contractor.findByIdAndUpdate(contractorId, { $push: { jobPosts: jobPost._id } })

    res.status(201).json({
      message: "Job post created successfully",
      jobPost,
    })
  } catch (error) {
    console.error("Create job post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update a job posting
const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params
    const contractorId = req.profileId

    // Check if job post exists and belongs to this contractor
    const jobPost = await JobPost.findOne({
      _id: id,
      contractorId,
    })

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found or unauthorized" })
    }

    // Update job post
    Object.keys(req.body).forEach((key) => {
      jobPost[key] = req.body[key]
    })

    // Save updated job post
    await jobPost.save()

    res.json({
      message: "Job post updated successfully",
      jobPost,
    })
  } catch (error) {
    console.error("Update job post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete a job posting
const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params
    const contractorId = req.profileId

    // Check if job post exists and belongs to this contractor
    const jobPost = await JobPost.findOne({
      _id: id,
      contractorId,
    })

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found or unauthorized" })
    }

    // Delete job post
    await JobPost.findByIdAndDelete(id)

    // Remove job post from contractor
    await Contractor.findByIdAndUpdate(contractorId, { $pull: { jobPosts: id } })

    // Notify applicants about job post deletion
    const applications = await JobApplication.find({ jobPostId: id })

    for (const application of applications) {
      await createNotification(
        application.workerId,
        "Worker",
        `A job you applied for (${jobPost.title}) has been removed by the contractor`,
        "job",
        application._id,
      )
    }

    // Delete all applications for this job
    await JobApplication.deleteMany({ jobPostId: id })

    res.json({ message: "Job post deleted successfully" })
  } catch (error) {
    console.error("Delete job post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a vehicle/instrument form
const createVehicleForm = async (req, res) => {
  try {
    const { title, type, payscale, brand, quantity, purchaseDate, location, organization, otherDetails } = req.body

    const contractorId = req.profileId

    // Get contractor profile for profile link
    const contractor = await Contractor.findById(contractorId)

    // Create vehicle form
    const vehicleForm = new VehicleForm({
      contractorId,
      title,
      type,
      payscale,
      brand,
      quantity,
      purchaseDate,
      location,
      organization: organization || contractor.organizationName,
      contractorProfileLink: `${process.env.FRONTEND_URL}/contractor/${contractorId}`,
      otherDetails,
    })

    // Save vehicle form
    await vehicleForm.save()

    // Update contractor with vehicle form
    await Contractor.findByIdAndUpdate(contractorId, { $push: { vehicleForms: vehicleForm._id } })

    res.status(201).json({
      message: "Vehicle/instrument form created successfully",
      vehicleForm,
    })
  } catch (error) {
    console.error("Create vehicle form error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update a vehicle/instrument form
const updateVehicleForm = async (req, res) => {
  try {
    const { id } = req.params
    const contractorId = req.profileId

    // Check if vehicle form exists and belongs to this contractor
    const vehicleForm = await VehicleForm.findOne({
      _id: id,
      contractorId,
    })

    if (!vehicleForm) {
      return res.status(404).json({ message: "Vehicle form not found or unauthorized" })
    }

    // Update vehicle form
    Object.keys(req.body).forEach((key) => {
      vehicleForm[key] = req.body[key]
    })

    // Save updated vehicle form
    await vehicleForm.save()

    res.json({
      message: "Vehicle/instrument form updated successfully",
      vehicleForm,
    })
  } catch (error) {
    console.error("Update vehicle form error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete a vehicle/instrument form
const deleteVehicleForm = async (req, res) => {
  try {
    const { id } = req.params
    const contractorId = req.profileId

    // Check if vehicle form exists and belongs to this contractor
    const vehicleForm = await VehicleForm.findOne({
      _id: id,
      contractorId,
    })

    if (!vehicleForm) {
      return res.status(404).json({ message: "Vehicle form not found or unauthorized" })
    }

    // Delete vehicle form
    await VehicleForm.findByIdAndDelete(id)

    // Remove vehicle form from contractor
    await Contractor.findByIdAndUpdate(contractorId, { $pull: { vehicleForms: id } })

    // Delete all applications for this vehicle form
    await VehicleApplication.deleteMany({ vehicleFormId: id })

    res.json({ message: "Vehicle/instrument form deleted successfully" })
  } catch (error) {
    console.error("Delete vehicle form error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get contractor dashboard data
const getDashboard = async (req, res) => {
  try {
    const contractorId = req.profileId

    // Get all job posts for this contractor
    const jobPosts = await JobPost.find({ contractorId }).sort({ createdAt: -1 })

    // Get all job applications for these job posts
    const jobApplications = await JobApplication.find({
      jobPostId: { $in: jobPosts.map((job) => job._id) },
    }).populate("workerId", "name email phone rating")

    // Get all vehicle forms for this contractor
    const vehicleForms = await VehicleForm.find({ contractorId }).sort({ createdAt: -1 })

    // Get all vehicle applications for these forms
    const vehicleApplications = await VehicleApplication.find({
      vehicleFormId: { $in: vehicleForms.map((form) => form._id) },
    }).populate({
      path: "applicantId",
      select: "name email phone rating",
      model: (doc) => doc.applicantModel,
    })

    // Categorize job applications
    const appliedCandidates = jobApplications.filter((app) =>
      ["considering", "rejected", "underreview"].includes(app.status),
    )

    const offerLetterSent = jobApplications.filter((app) => ["offerSent", "offerAccepted"].includes(app.status))

    const joiningLetterSent = jobApplications.filter((app) => app.status === "joiningLetterSent")

    // Get recommended workers for each job
    const jobRecommendations = {}
    for (const job of jobPosts) {
      const { recommendations } = await recommendWorkersForJob(job._id)
      jobRecommendations[job._id] = recommendations || []
    }

    res.json({
      jobPosts,
      vehicleForms,
      jobApplications: {
        appliedCandidates,
        offerLetterSent,
        joiningLetterSent,
      },
      vehicleApplications,
      jobRecommendations,
    })
  } catch (error) {
    console.error("Get contractor dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Process job application (consider, reject, send offer)
const processJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { action, feedback } = req.body // 'consider', 'reject', 'sendOffer'
    const contractorId = req.profileId

    // Check if application exists and belongs to a job post by this contractor
    const application = await JobApplication.findById(applicationId).populate({
      path: "jobPostId",
      select: "contractorId title payscale location duration",
    })

    if (!application || application.jobPostId.contractorId.toString() !== contractorId.toString()) {
      return res.status(404).json({ message: "Application not found or unauthorized" })
    }

    // Process based on action
    if (action === "consider") {
      application.status = "considering"
      await application.save()

      // Create notification for worker
      await createNotification(
        application.workerId,
        "Worker",
        `Your application for ${application.jobPostId.title} is being considered`,
        "application",
        application._id,
      )

      res.json({ message: "Application marked as considering" })
    } else if (action === "reject") {
      application.status = "rejected"
      await application.save()

      // Create notification for worker
      await createNotification(
        application.workerId,
        "Worker",
        `Your application for ${application.jobPostId.title} has been rejected${feedback ? ": " + feedback : ""}`,
        "application",
        application._id,
      )

      res.json({ message: "Application rejected" })
    } else if (action === "sendOffer") {
      // Get contractor details
      const contractor = await Contractor.findById(contractorId)

      // Generate offer letter
      const offerLetterResult = await generateOfferLetter({
        workerName: application.name,
        contractorName: contractor.name,
        organizationName: contractor.organizationName,
        jobTitle: application.jobPostId.title,
        payscale: application.jobPostId.payscale,
        location: application.jobPostId.location,
        startDate: new Date().toLocaleDateString(),
        duration: application.jobPostId.duration,
      })

      if (!offerLetterResult.success) {
        return res.status(500).json({ message: "Failed to generate offer letter" })
      }

      // Update application with offer letter URL
      application.status = "offerSent"
      application.offerLetter = offerLetterResult.url
      await application.save()

      // Create notification for worker
      await createNotification(
        application.workerId,
        "Worker",
        `You have received an offer letter for ${application.jobPostId.title}`,
        "offer",
        application._id,
      )

      res.json({
        message: "Offer letter sent successfully",
        offerLetterUrl: offerLetterResult.url,
      })
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "consider", "reject", or "sendOffer"' })
    }
  } catch (error) {
    console.error("Process job application error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Send joining letter
const sendJoiningLetter = async (req, res) => {
  try {
    const { applicationId } = req.params
    const contractorId = req.profileId

    // Check if application exists, has accepted offer, and belongs to a job post by this contractor
    const application = await JobApplication.findOne({
      _id: applicationId,
      status: "offerAccepted",
    }).populate({
      path: "jobPostId",
      select: "contractorId title payscale location duration",
    })

    if (!application || application.jobPostId.contractorId.toString() !== contractorId.toString()) {
      return res.status(404).json({ message: "Application not found, unauthorized, or offer not accepted" })
    }

    // Get contractor details
    const contractor = await Contractor.findById(contractorId)

    // Generate joining letter
    const joiningLetterResult = await generateJoiningLetter({
      workerName: application.name,
      contractorName: contractor.name,
      organizationName: contractor.organizationName,
      jobTitle: application.jobPostId.title,
      payscale: application.jobPostId.payscale,
      location: application.jobPostId.location,
      startDate: new Date().toLocaleDateString(),
      duration: application.jobPostId.duration,
    })

    if (!joiningLetterResult.success) {
      return res.status(500).json({ message: "Failed to generate joining letter" })
    }

    // Update application with joining letter URL
    application.status = "joiningLetterSent"
    application.joiningLetter = joiningLetterResult.url
    await application.save()

    // Create notification for worker
    await createNotification(
      application.workerId,
      "Worker",
      `You have received a joining letter for ${application.jobPostId.title}`,
      "joining",
      application._id,
    )

    res.json({
      message: "Joining letter sent successfully",
      joiningLetterUrl: joiningLetterResult.url,
    })
  } catch (error) {
    console.error("Send joining letter error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Process vehicle application (accept, reject)
const processVehicleApplication = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { action, feedback } = req.body // 'accept', 'reject'
    const contractorId = req.profileId

    // Check if application exists and belongs to a vehicle form by this contractor
    const application = await VehicleApplication.findById(applicationId).populate({
      path: "vehicleFormId",
      select: "contractorId title type",
    })

    if (!application || application.vehicleFormId.contractorId.toString() !== contractorId.toString()) {
      return res.status(404).json({ message: "Application not found or unauthorized" })
    }

    // Process based on action
    if (action === "accept") {
      application.status = "accepted"
      if (feedback) {
        application.feedback = feedback
      }
      await application.save()

      // Create notification for applicant
      await createNotification(
        application.applicantId,
        application.applicantModel,
        `Your application for ${application.vehicleFormId.title} has been accepted`,
        "vehicle",
        application._id,
      )

      res.json({ message: "Vehicle application accepted" })
    } else if (action === "reject") {
      application.status = "rejected"
      if (feedback) {
        application.feedback = feedback
      }
      await application.save()

      // Create notification for applicant
      await createNotification(
        application.applicantId,
        application.applicantModel,
        `Your application for ${application.vehicleFormId.title} has been rejected${feedback ? ": " + feedback : ""}`,
        "vehicle",
        application._id,
      )

      res.json({ message: "Vehicle application rejected" })
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' })
    }
  } catch (error) {
    console.error("Process vehicle application error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Send invitation to workers or owners
const sendInvitation = async (req, res) => {
  try {
    const { userType, userId, jobPostId, vehicleFormId, message } = req.body
    const contractorId = req.profileId

    // Validate input
    if (!userType || !userId || (!jobPostId && !vehicleFormId) || !message) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    if (userType !== "Worker" && userType !== "Owner") {
      return res.status(400).json({ message: "Invalid user type" })
    }

    // Check if user exists
    let user
    if (userType === "Worker") {
      user = await Worker.findById(userId)
    } else {
      user = await Owner.findById(userId)
    }

    if (!user) {
      return res.status(404).json({ message: `${userType} not found` })
    }

    // Check if job post or vehicle form exists and belongs to this contractor
    let referenceId
    let type
    let title

    if (jobPostId) {
      const jobPost = await JobPost.findOne({
        _id: jobPostId,
        contractorId,
      })

      if (!jobPost) {
        return res.status(404).json({ message: "Job post not found or unauthorized" })
      }

      referenceId = jobPost._id
      type = "job"
      title = jobPost.title
    } else {
      const vehicleForm = await VehicleForm.findOne({
        _id: vehicleFormId,
        contractorId,
      })

      if (!vehicleForm) {
        return res.status(404).json({ message: "Vehicle form not found or unauthorized" })
      }

      referenceId = vehicleForm._id
      type = "vehicle"
      title = vehicleForm.title
    }

    // Create notification for user
    const notification = await createNotification(userId, userType, message, type, referenceId)

    if (!notification.success) {
      return res.status(500).json({ message: "Failed to send invitation" })
    }

    res.json({
      message: `Invitation sent successfully to ${userType.toLowerCase()}`,
      notification: notification.notification,
    })
  } catch (error) {
    console.error("Send invitation error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export {
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
}

