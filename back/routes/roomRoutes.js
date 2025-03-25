const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authMiddleware");

// Toutes les routes de room nécessitent une authentification
router.use(authMiddleware);

// Créer une nouvelle room
router.post("/", roomController.createRoom);

// Obtenir toutes les rooms publiques
router.get("/public", roomController.getAllPublicRooms);

// Obtenir une room spécifique par ID
router.get("/:roomId", roomController.getRoomById);

// Rejoindre une room publique
router.post("/:roomId/join", roomController.joinRoom);

// Inviter un utilisateur à une room
router.post("/:roomId/invite", roomController.inviteToRoom);

// Quitter une room
router.delete("/:roomId/leave", roomController.leaveRoom);

// Supprimer une room (seulement le créateur)
router.delete("/:roomId", roomController.deleteRoom);

module.exports = router;
