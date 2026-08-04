import express from "express";
import * as userController from "../controller/user.js";

const router = express.Router();

router.get("/:shareCode/stays", userController.getStaysByShareCode);

export default router;
