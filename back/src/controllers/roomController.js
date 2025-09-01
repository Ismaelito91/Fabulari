const { Room, User, Message } = require("../models");

// Créer une nouvelle room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    const room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      creatorId: req.user.id,
    });

    // Ajouter le créateur comme membre de la room
    await room.addUser(req.user.id);

    res.status(201).json({
      message: "Room créée avec succès",
      room,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la room:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer toutes les rooms publiques
exports.getAllPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { isPrivate: false },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
        },
      ],
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Erreur lors de la récupération des rooms:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer une room par son ID
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "username"],
          through: { attributes: [] },
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur a accès à cette room
    if (room.isPrivate) {
      const isMember = await room.hasUser(req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: "Accès refusé." });
      }
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Erreur lors de la récupération de la room:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Rejoindre une room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si la room est privée
    if (room.isPrivate) {
      return res.status(403).json({ message: "Cette room est privée." });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isMember = await room.hasUser(req.user.id);
    if (isMember) {
      return res
        .status(400)
        .json({ message: "Vous êtes déjà membre de cette room." });
    }

    // Ajouter l'utilisateur comme membre
    await room.addUser(req.user.id);

    res.status(200).json({ message: "Vous avez rejoint la room avec succès." });
  } catch (error) {
    console.error("Erreur lors de la tentative de rejoindre la room:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Inviter un utilisateur à une room privée
exports.inviteToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur courant est le créateur ou un membre
    const isMember = await room.hasUser(req.user.id);
    if (!isMember && room.creatorId !== req.user.id) {
      return res.status(403).json({
        message: "Vous n'avez pas les droits pour inviter dans cette room.",
      });
    }

    // Vérifier si l'utilisateur à inviter existe
    const userToInvite = await User.findByPk(userId);
    if (!userToInvite) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isAlreadyMember = await room.hasUser(userId);
    if (isAlreadyMember) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur est déjà membre de la room." });
    }

    // Ajouter l'utilisateur comme membre
    await room.addUser(userId);

    res.status(200).json({ message: "Invitation envoyée avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'invitation:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Quitter une room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur est membre
    const isMember = await room.hasUser(req.user.id);
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "Vous n'êtes pas membre de cette room." });
    }

    // Le créateur ne peut pas quitter sa propre room
    if (room.creatorId === req.user.id) {
      return res.status(400).json({
        message:
          "Le créateur ne peut pas quitter sa propre room. Vous pouvez la supprimer.",
      });
    }

    // Retirer l'utilisateur de la room
    await room.removeUser(req.user.id);

    res.status(200).json({ message: "Vous avez quitté la room avec succès." });
  } catch (error) {
    console.error("Erreur lors de la tentative de quitter la room:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Supprimer une room (réservé au créateur)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room non trouvée." });
    }

    // Vérifier si l'utilisateur est le créateur
    if (room.creatorId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Seul le créateur peut supprimer la room." });
    }

    await room.destroy();

    res.status(200).json({ message: "Room supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de la room:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
