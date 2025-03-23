import mongoose from "mongoose";

const vehicleOwnerSchema = new mongoose.Schema(
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
    organizationOrSelf: {
      type: String,
      required: true,
      enum: ["Organization", "Self"], // Ensures valid input
    },
    location: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    availableVehicles: {
      type: Number,
      default: 0,
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

export const VehicleOwner = mongoose.model("VehicleOwner", vehicleOwnerSchema);
