const mongoose = require("mongoose")

const JobPostSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor", required: true },
  title: { type: String, required: true },
  payscale: { type: Number, required: true },
  requiredSkill: { type: String, required: true },
  experienceRequired: { type: Number, required: true },
  noOfWorkers: { type: Number, required: true },
  duration: { type: String },
  location: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobApplication" }],
})

module.exports = mongoose.model("JobPost", JobPostSchema)

