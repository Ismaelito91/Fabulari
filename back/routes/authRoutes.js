const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Routes publiques
router.post("/register", authController.register);
router.post("/login", authController.login);

// Routes protégées
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/avatar", authMiddleware, authController.updateAvatar);

module.exports = router;
