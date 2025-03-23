import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    workProfileOrLookingFor: {
      type: String,
      required: true,
    },
    pastExperience: {
      type: String,
      default: "No experience",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    expectedSalary: {
      type: Number,
      required: true,
    },
    resume: {
      type: String, 
      default: "",
    },
    currentStatus: {
      type: String,
      enum: ["Available", "Hired", "Looking for Work"],
      default: "Looking for Work",
    },
  },
  { timestamps: true }
);

export const Worker = mongoose.model("Worker", workerSchema);
