import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "applicationType",
    },
    applicationType: {
      type: String,
      enum: ["JobApplication", "VehicleApplication"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Rejected", "Accepted"],
      default: "Applied",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Tracking = mongoose.model("Tracking", trackingSchema);
