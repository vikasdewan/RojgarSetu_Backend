import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Employeer", "VehicleOwner", "Worker"],
      required: true,
    },

    // Common fields
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Employer-specific fields
    workProfile: {
      type: String,
      default: null,
    },
    completedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedProject",
        default: [],
      },
    ],
    organization: {
      type: String,
      default: null,
    },

    // Vehicle Owner-specific fields
    organizationOrSelf: {
      type: String,
      default: null,
      enum: ["Organization", "Self", null],
    },
    availableVehicles: {
      type: Number,
      default: 0,
    },

    // Worker-specific fields
    workProfileOrLookingFor: {
      type: String,
      default: null,
    },
    pastExperience: {
      type: String,
      default: "No experience",
    },
    expectedSalary: {
      type: Number,
      default: null,
    },
    resume: {
      type: String, // Store resume URL
      default: "",
    },
    currentStatus: {
      type: String,
      enum: ["Available", "Hired", "Looking for Work", null],
      default: "Looking for Work",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
