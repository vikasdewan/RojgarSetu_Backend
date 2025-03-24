import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  applyForJob,
  trackApplication,
  updateApplicationStatus,
  applyForVehicle,
  getVehicleApplications
} from "../controllers/application.controller.js";

const router = express.Router();

// Job Applications
router.route("/job")
  .post(verifyJWT, applyForJob)
  .get(verifyJWT, trackApplication);

router.route("/job/:id/status").patch(verifyJWT, updateApplicationStatus);

// Vehicle Applications
router.route("/vehicle")
  .post(verifyJWT, applyForVehicle)
  .get(verifyJWT, getVehicleApplications);

export default router;