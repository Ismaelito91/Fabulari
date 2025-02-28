import { Router } from "express";
import { register, login, getProfile } from "../controllers/userController";
import { validateRegistration } from "../middlewares/validationMiddleware";

const router = Router();

router.post("/register", validateRegistration, register);
router.post("/login", login);
router.get("/profile", getProfile);

export default router;
