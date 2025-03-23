import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String, // Example: "Truck", "Crane", "Excavator"
      required: true,
    },
    payscale: {
      type: Number, // Rental price or contract rate
      required: true,
    },
    brand: {
      type: String, // Example: "Tata", "Volvo", "JCB"
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    lifeOfVehicle: {
      type: String, // Example: "5 years", "10 years"
      required: true,
    },
    otherDetails: {
      type: String,
      default: "",
    },
    contractorDetail: {
      type: String, // Store contractor profile link or reference
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    organization: {
      type: String, // Name of the company/organization
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
