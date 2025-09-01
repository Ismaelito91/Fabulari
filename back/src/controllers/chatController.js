const { Message, User, Room } = require("../models");

// Envoyer un message dans une room
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur est membre de la room
    const isMember = await room.hasUser(req.user.id);
    if (!isMember && room.isPrivate) {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à envoyer des messages dans cette room.",
      });
    }

    const message = await Message.create({
      content,
      userId: req.user.id,
      roomId,
    });

    // Inclure les informations de l'utilisateur dans la réponse
    const messageWithUser = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
    });

    // Ici, vous pourriez émettre un événement socket.io pour le temps réel

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer les messages d'une room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur est membre de la room privée
    if (room.isPrivate) {
      const isMember = await room.hasUser(req.user.id);
      if (!isMember) {
        return res
          .status(403)
          .json({ message: "Accès refusé aux messages de cette room." });
      }
    }

    const messages = await Message.findAndCountAll({
      where: { roomId },
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      messages: messages.rows,
      total: messages.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Supprimer un message (seulement l'auteur peut le faire)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message non trouvé." });
    }

    // Vérifier si l'utilisateur est l'auteur du message
    if (message.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce message." });
    }

    await message.destroy();

    res.status(200).json({ message: "Message supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Éditer un message (seulement l'auteur peut le faire)
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message non trouvé." });
    }

    // Vérifier si l'utilisateur est l'auteur du message
    if (message.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à éditer ce message." });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("Erreur lors de l'édition du message:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
