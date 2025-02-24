import express from "express";
import { register } from "../controllers/userController";
import { validateRegistration } from "../middlewares/validationMiddleware";

const router = express.Router();

router.post("/register", validateRegistration, register);

export default router;
