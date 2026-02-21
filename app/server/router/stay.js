import express from "express";
import * as stayController from "../controller/stay.js";
const router = express.Router();

router.get("/", stayController.getStays);
router.get("/:id", stayController.getStayById);

// TODO: CRUD stay
router.post("/", "");
router.delete("/:id", "");
router.patch("/:id", "");

export default router;
