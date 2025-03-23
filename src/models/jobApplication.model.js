import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    experience: {
      type: String, // Example: "2 years", "No experience"
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: true,
    },
    profileLink: {
      type: String, // Example: LinkedIn, GitHub, Portfolio link
      default: "",
    },
    lookingFor: {
      type: String, // Example: "Software Developer", "Construction Worker"
      required: true,
    },
    resume: {
      type: String, // Store resume file URL
      required: true,
    },
    availableFor: {
      type: String, // Example: "6 months", "1 year", "Full-time"
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
