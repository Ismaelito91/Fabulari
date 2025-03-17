const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

// Toutes les routes de chat nécessitent une authentification
router.use(authMiddleware);

// Envoyer un message dans une room
router.post("/rooms/:roomId/messages", chatController.sendMessage);

// Récupérer les messages d'une room
router.get("/rooms/:roomId/messages", chatController.getRoomMessages);

// Supprimer un message
router.delete("/messages/:messageId", chatController.deleteMessage);

// Modifier un message
router.put("/messages/:messageId", chatController.editMessage);

module.exports = router;
