import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  submitReview,
  getUserReviews,
  updateReview,
  deleteReview
} from "../controllers/review.controller.js";

const router = express.Router();

router.route("/")
  .post(verifyJWT, submitReview)
  .get(verifyJWT, getUserReviews);

router.route("/:id")
  .patch(verifyJWT, updateReview)
  .delete(verifyJWT, deleteReview);

export default router;