const mongoose = require("mongoose")

const VehicleFormSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["vehicle", "instrument"], required: true },
  payscale: { type: Number, required: true },
  brand: { type: String },
  quantity: { type: Number },
  purchaseDate: { type: Date },
  location: { type: String, required: true },
  organization: { type: String },
  contractorProfileLink: { type: String },
  otherDetails: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "VehicleApplication" }],
})

module.exports = mongoose.model("VehicleForm", VehicleFormSchema)

