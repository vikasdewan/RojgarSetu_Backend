import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createVehicleListing,
  updateVehicleListing,
  deleteVehicleListing,
  getVehicleDetails,
  listVehicles,
  searchVehicles
} from "../controllers/vehicle.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.route("/")
  .post(verifyJWT, checkRole(['VehicleOwner']), createVehicleListing)
  .get(listVehicles);

router.route("/:id")
  .get(getVehicleDetails)
  .patch(verifyJWT, checkRole(['VehicleOwner']), updateVehicleListing)
  .delete(verifyJWT, checkRole(['VehicleOwner']), deleteVehicleListing);

router.route("/search").get(searchVehicles);

export default router;