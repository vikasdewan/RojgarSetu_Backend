import mongoose from "mongoose";

const vehicleApplicationSchema = new mongoose.Schema(
  {
    type: {
      type: String, // Example: "Truck", "Crane"
      required: true,
    },
    brand: {
      type: String, // Example: "Tata", "JCB"
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    lifeOfVehicle: {
      type: String, // Example: "5 years"
      required: true,
    },
    otherDetails: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    ownerDetails: {
      type: String, // Store owner reference or link
      required: true,
    },
    picture: {
      type: String, // Store image URL of the vehicle
      default: "",
    },
  },
  { timestamps: true }
);

export const VehicleApplication = mongoose.model(
  "VehicleApplication",
  vehicleApplicationSchema
);
