const mongoose = require("mongoose")

const VehicleApplicationSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, refPath: "applicantModel", required: true },
  applicantModel: { type: String, enum: ["Worker", "Owner"], required: true },
  vehicleFormId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleForm", required: true },
  type: { type: String }, // repeated info if necessary
  brand: { type: String },
  quantity: { type: Number },
  purchaseDate: { type: Date },
  location: { type: String },
  pictures: [{ type: String }], // URLs from Cloudinary
  ownerDetails: { type: String },
  appliedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("VehicleApplication", VehicleApplicationSchema)

