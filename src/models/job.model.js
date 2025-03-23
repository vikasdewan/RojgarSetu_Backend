import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    payscale: {
      type: Number,
      required: true,
    },
    requiredSkills: {
      type: [String], // Array of skills (e.g., ["Plumbing", "Carpentry"])
      required: true,
    },
    experienceRequired: {
      type: String, // Example: "2 years", "No experience required"
      required: true,
    },
    numberOfWorkers: {
      type: Number,
      required: true,
    },
    duration: {
      type: String, // Example: "6 months", "1 year", "Temporary"
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const Job = mongoose.model("Job", jobSchema);
