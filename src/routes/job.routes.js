import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createJob,
  updateJob,
  deleteJob,
  getJobDetails,
  listJobs,
  searchJobs,
  getJobApplications
} from "../controllers/job.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Job CRUD Operations
router.route("/")
  .post(verifyJWT, checkRole(['Employer']), createJob)
  .get(listJobs);

router.route("/:id")
  .get(getJobDetails)
  .patch(verifyJWT, checkRole(['Employer']), updateJob)
  .delete(verifyJWT, checkRole(['Employer']), deleteJob);

router.route("/search").get(searchJobs);
router.route("/:id/applications").get(verifyJWT, checkRole(['Employer']), getJobApplications);

export default router;