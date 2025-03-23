import mongoose from "mongoose";

const employeerSchema = new mongoose.Schema(
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
    image: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    workProfile: {
      type: String,
      default: "",
    },
    completedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompletedProject",
      },
    ],
    organization: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Employeer = mongoose.model("Employeer", employeerSchema);
