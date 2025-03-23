import mongoose from "mongoose";

const completedProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    numberOfEmployees: {
      type: Number,
      required: true,
    },
    duration: {
      type: String, // e.g., "6 months", "1 year"
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    images: [
      {
        type: String, // Store image URLs
        default: "",
      },
    ],
  },
  { timestamps: true }
);

export const CompletedProject = mongoose.model(
  "CompletedProject",
  completedProjectSchema
);
