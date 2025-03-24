import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateWorkStatus,
  getWorkerApplications,
  getEmployerJobs,
  getVehicleOwnerListings
} from "../controllers/user.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Authentication Routes
router.route("/register").post(uploadOnCloudinary.single("image"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

// Profile Management
router.route("/profile") 
  .get(verifyJWT, getUserProfile)
  .patch(verifyJWT, uploadOnCloudinary.single("image"), updateUserProfile);

router.route("/change-password").patch(verifyJWT, changePassword);

// Role-Specific Routes
router.route("/work-status").patch(verifyJWT, updateWorkStatus);
router.route("/worker/applications").get(verifyJWT, getWorkerApplications);
router.route("/employer/jobs").get(verifyJWT, getEmployerJobs);
router.route("/vehicle-owner/listings").get(verifyJWT, getVehicleOwnerListings);

export default router;