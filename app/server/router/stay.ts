import express from "express";
import * as stayController from "../controller/stay.js";
import { requiredAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requiredAuth);

router.get("/", stayController.getStays);
router.get("/:id", stayController.getStayById);
router.delete("/:id", stayController.removeStay);
router.post("/", stayController.createStay);
router.patch("/:id", stayController.updateStay);

export default router;
