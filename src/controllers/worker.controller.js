import { Worker, JobPost, JobApplication } from "../models/index.js"
import { createNotification } from "../utils/notification.util.js"
import { recommendJobsForWorker } from "../utils/recommendation.util.js"

// Get worker portfolio
const getPortfolio = async (req, res) => {
  try {
    const workerId = req.params.id || req.profileId

    const worker = await Worker.findById(workerId)

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" })
    }

    // Return portfolio data
    res.json({
      portfolio: {
        id: worker._id,
        name: worker.name,
        currentStatus: worker.currentStatus,
        lookingFor: worker.lookingFor,
        pastExperience: worker.pastExperience,
        rating: worker.rating,
        image: worker.image,
      },
    })
  } catch (error) {
    console.error("Get portfolio error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobPostId } = req.params
    const { experience, availability } = req.body
    const workerId = req.profileId

    // Check if job exists
    const job = await JobPost.findById(jobPostId)
    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    // Check if worker has already applied
    const existingApplication = await JobApplication.findOne({
      workerId,
      jobPostId,
    })

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" })
    }

    // Get worker details
    const worker = await Worker.findById(workerId)
    if (!worker) {
      return res.status(404).json({ message: "Worker profile not found" })
    }

    // Create job application
    const application = new JobApplication({
      workerId,
      jobPostId,
      name: worker.name,
      experience: experience || 0,
      email: worker.email,
      phone: worker.phone,
      profileLink: worker.portfolio,
      lookingFor: worker.lookingFor,
      resume: worker.resume,
      availability,
    })

    // Save application
    await application.save()

    // Update job with application
    job.applications.push(application._id)
    await job.save()

    // Update worker with applied job
    worker.appliedJobs.push(application._id)
    await worker.save()

    // Create notification for contractor
    await createNotification(
      job.contractorId,
      "Contractor",
      `New job application received from ${worker.name} for ${job.title}`,
      "application",
      application._id,
    )

    res.status(201).json({
      message: "Job application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Job application error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get worker dashboard data
const getDashboard = async (req, res) => {
  try {
    const workerId = req.profileId

    // Get all applications for this worker
    const applications = await JobApplication.find({ workerId })
      .populate({
        path: "jobPostId",
        select: "title payscale location duration",
        populate: {
          path: "contractorId",
          select: "name organizationName",
        },
      })
      .sort({ appliedAt: -1 })

    // Categorize applications
    const appliedJobs = applications.filter((app) => ["considering", "rejected", "underreview"].includes(app.status))

    const offerLetterJobs = applications.filter((app) => ["offerSent", "offerAccepted"].includes(app.status))

    const joiningLetterJobs = applications.filter((app) => app.status === "joiningLetterSent")

    // Get recommended jobs
    const { recommendations } = await recommendJobsForWorker(workerId)

    res.json({
      appliedJobs,
      offerLetterJobs,
      joiningLetterJobs,
      recommendedJobs: recommendations || [],
    })
  } catch (error) {
    console.error("Get worker dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Accept or reject offer letter
const respondToOffer = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { action } = req.body // 'accept' or 'reject'
    const workerId = req.profileId

    // Check if application exists
    const application = await JobApplication.findOne({
      _id: applicationId,
      workerId,
      status: "offerSent",
    })

    if (!application) {
      return res.status(404).json({ message: "Offer not found or already processed" })
    }

    if (action === "accept") {
      application.status = "offerAccepted"
      await application.save()

      // Create notification for contractor
      await createNotification(
        application.jobPostId.contractorId,
        "Contractor",
        `${application.name} has accepted your job offer`,
        "offer",
        application._id,
      )

      res.json({ message: "Offer accepted successfully" })
    } else if (action === "reject") {
      application.status = "rejected"
      await application.save()

      // Create notification for contractor
      await createNotification(
        application.jobPostId.contractorId,
        "Contractor",
        `${application.name} has rejected your job offer`,
        "offer",
        application._id,
      )

      res.json({ message: "Offer rejected successfully" })
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject"' })
    }
  } catch (error) {
    console.error("Respond to offer error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Accept joining letter and update status
const acceptJoiningLetter = async (req, res) => {
  try {
    const { applicationId } = req.params
    const workerId = req.profileId

    // Check if application exists
    const application = await JobApplication.findOne({
      _id: applicationId,
      workerId,
      status: "joiningLetterSent",
    }).populate("jobPostId")

    if (!application) {
      return res.status(404).json({ message: "Joining letter not found or already processed" })
    }

    // Update worker status to working
    const worker = await Worker.findById(workerId)
    worker.currentStatus = "working"
    await worker.save()

    // Create notification for contractor
    await createNotification(
      application.jobPostId.contractorId,
      "Contractor",
      `${application.name} has accepted the joining letter and is ready to start work`,
      "joining",
      application._id,
    )

    res.json({
      message: 'Joining letter accepted successfully. Your status has been updated to "working"',
    })
  } catch (error) {
    console.error("Accept joining letter error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export { getPortfolio, applyForJob, getDashboard, respondToOffer, acceptJoiningLetter }

