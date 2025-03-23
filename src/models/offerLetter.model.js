import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "accepted", "rejected"],
      default: "sent",
    },
    letterContent: {
      type: String,
      required: true,
    },
    dateSent: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);
