import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { sequelize, testConnection } from "./config/database";
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import roomRoutes from "./routes/roomRoutes";
import dotenv from "dotenv";
import models from "./models";
import path from "path";
import * as jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);

// Ajouter avant les autres routes
app.get("/test-chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../test-chat.html"));
});

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Base de données synchronisée");
  } catch (error) {
    console.error("❌ Erreur de synchronisation de la base de données");
    // Ne pas faire échouer le démarrage du serveur si la synchronisation échoue
  }
};

const initializeDatabase = async () => {
  try {
    await testConnection();
    await syncDatabase();
    return true;
  } catch (error) {
    console.error("❌ Erreur d'initialisation de la base de données");
    return false;
  }
};

// Initialiser la base de données puis démarrer le serveur
initializeDatabase()
  .then((dbSuccess) => {
    if (!dbSuccess) {
      console.warn("⚠️ Le serveur démarre sans connexion à la base de données");
    }

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () =>
      console.log(`🚀 Serveur démarré sur le port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Erreur critique lors du démarrage du serveur");
  });

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("❌ Erreur non capturée");
  // Ne pas faire crasher le serveur
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesse rejetée non gérée");
  // Ne pas faire crasher le serveur
});

interface ChatMessage {
  roomId: string;
  message: string;
  userId: number;
}

interface TypingEvent {
  roomId: string;
}

interface AvatarUpdate {
  backgroundColor: string;
  textColor: string;
}

// Définir les types d'état de présence
enum PresenceStatus {
  ONLINE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline",
  INVISIBLE = "invisible",
}

interface UserPresence {
  status: PresenceStatus;
  lastActivity: Date;
  customMessage?: string;
}

// Structure pour suivre les utilisateurs connectés
const connectedUsers = new Map<number, string>(); // userId -> socketId
const roomUsers = new Map<string, Set<number>>(); // roomId -> Set of userIds
const typingUsers = new Map<string, Set<number>>(); // roomId -> Set of typing userIds
const userAvatarSettings = new Map<number, AvatarUpdate>(); // userId -> avatar settings
const userPresence = new Map<number, UserPresence>(); // userId -> présence

// Fonction pour mettre à jour la présence d'un utilisateur
const updateUserPresence = async (
  userId: number,
  status: PresenceStatus,
  customMessage?: string
) => {
  // Mettre à jour l'état de présence
  userPresence.set(userId, {
    status,
    lastActivity: new Date(),
    customMessage,
  });

  // Récupérer l'utilisateur
  const user = await models.User.findByPk(userId);

  // Informer tous les utilisateurs dans les rooms où cet utilisateur est présent
  for (const [roomId, users] of roomUsers.entries()) {
    if (users.has(userId)) {
      io.to(roomId).emit("presenceUpdate", {
        userId,
        username: user?.username,
        status,
        customMessage,
      });
    }
  }
};

// Vérifier périodiquement les utilisateurs inactifs
setInterval(async () => {
  const now = new Date();
  const AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  for (const [userId, presence] of userPresence.entries()) {
    // Si l'utilisateur est en ligne mais inactif depuis plus de 5 minutes
    if (
      presence.status === PresenceStatus.ONLINE &&
      now.getTime() - presence.lastActivity.getTime() > AWAY_TIMEOUT
    ) {
      // Mettre à jour son statut en "absent"
      await updateUserPresence(userId, PresenceStatus.AWAY);
    }
  }
}, 60 * 1000); // Vérifier toutes les minutes

// Gestion des connexions Socket.IO
io.on("connection", (socket: Socket) => {
  // Authentifier l'utilisateur
  socket.on("authenticate", async (data: { token: string }) => {
    try {
      const decoded = jwt.verify(
        data.token,
        process.env.JWT_SECRET || "secret"
      ) as { userId: number };
      const userId = decoded.userId;

      // Associer le socket à l'utilisateur
      connectedUsers.set(userId, socket.id);
      socket.data.userId = userId;

      // Initialiser la présence de l'utilisateur
      userPresence.set(userId, {
        status: PresenceStatus.ONLINE,
        lastActivity: new Date(),
      });

      // Récupérer les informations de l'utilisateur
      const user = await models.User.findByPk(userId, {
        include: [{ model: models.Avatar, as: "avatar" }],
      });

      // Récupérer l'avatar séparément pour éviter l'erreur de type
      const avatar = await models.Avatar.findOne({ where: { userId } });

      // Informer l'utilisateur qu'il est authentifié
      socket.emit("authenticated", {
        userId,
        username: user?.username,
        avatar: avatar
          ? {
              hair: avatar.hair,
              face: avatar.face,
              eyes: avatar.eyes,
              outfit: avatar.outfit,
              currentX: avatar.currentX,
              currentY: avatar.currentY,
            }
          : null,
        presence: userPresence.get(userId),
      });
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      socket.emit("error", { message: "Authentification échouée" });
    }
  });

  // Rejoindre une room
  socket.on("joinRoom", async (roomId: string) => {
    socket.join(roomId);

    // Initialiser la liste des utilisateurs de la room si elle n'existe pas
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }

    // Initialiser la liste des utilisateurs qui tapent dans cette room
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }

    if (socket.data.userId) {
      const userId = socket.data.userId;

      // Ajouter l'utilisateur à la liste des utilisateurs de la room
      roomUsers.get(roomId)?.add(userId);

      // Récupérer l'avatar de l'utilisateur
      const avatar = await models.Avatar.findOne({ where: { userId } });
      const user = await models.User.findByPk(userId);

      // Informer les autres utilisateurs de la room qu'un nouvel utilisateur a rejoint
      socket.to(roomId).emit("userJoined", {
        userId,
        username: user?.username,
        avatar: avatar
          ? {
              hair: avatar.hair,
              face: avatar.face,
              eyes: avatar.eyes,
              outfit: avatar.outfit,
              currentX: avatar.currentX,
              currentY: avatar.currentY,
            }
          : null,
      });

      // Mettre à jour l'activité de l'utilisateur
      if (userPresence.has(userId)) {
        const presence = userPresence.get(userId)!;
        presence.lastActivity = new Date();
        userPresence.set(userId, presence);
      }

      // Envoyer la liste des utilisateurs connectés dans la room avec leur état de présence
      const usersInRoom = [];
      for (const currentUserId of roomUsers.get(roomId) || []) {
        const currentUser = await models.User.findByPk(currentUserId);
        const userAvatar = await models.Avatar.findOne({
          where: { userId: currentUserId },
        });

        // Récupérer les paramètres personnalisés de l'avatar
        const avatarSettings = userAvatarSettings.get(currentUserId);
        const presence = userPresence.get(currentUserId) || {
          status: PresenceStatus.OFFLINE,
          lastActivity: new Date(),
        };

        usersInRoom.push({
          userId: currentUserId,
          username: currentUser?.username,
          avatar: {
            ...(userAvatar
              ? {
                  hair: userAvatar.hair,
                  face: userAvatar.face,
                  eyes: userAvatar.eyes,
                  outfit: userAvatar.outfit,
                  currentX: userAvatar.currentX,
                  currentY: userAvatar.currentY,
                }
              : null),
            ...(avatarSettings || {}),
          },
          presence,
        });
      }

      socket.emit("roomUsers", usersInRoom);
    }
  });

  // Quitter une room
  socket.on("leaveRoom", (roomId: string) => {
    socket.leave(roomId);

    if (socket.data.userId) {
      const userId = socket.data.userId;

      // Retirer l'utilisateur de la liste des utilisateurs de la room
      roomUsers.get(roomId)?.delete(userId);

      // Retirer l'utilisateur de la liste des utilisateurs qui tapent
      typingUsers.get(roomId)?.delete(userId);

      // Informer les autres utilisateurs de la room que l'utilisateur est parti
      socket.to(roomId).emit("userLeft", {
        userId,
      });
    }
  });

  // Déplacer l'avatar
  socket.on(
    "moveAvatar",
    async (data: { roomId: string; currentX: number; currentY: number }) => {
      if (!socket.data.userId) return;

      const userId = socket.data.userId;
      const { roomId, currentX, currentY } = data;

      try {
        // Mettre à jour la position de l'avatar dans la base de données
        const avatar = await models.Avatar.findOne({ where: { userId } });

        if (avatar) {
          await avatar.update({ currentX, currentY });

          // Informer les autres utilisateurs du déplacement
          socket.to(roomId).emit("avatarMoved", {
            userId,
            currentX,
            currentY,
          });
        }
      } catch (error) {
        console.error("Erreur lors du déplacement de l'avatar:", error);
      }
    }
  );

  // Envoyer un message
  socket.on("chatMessage", async (data: ChatMessage) => {
    const { roomId, message, userId } = data;

    // Sauvegarder le message dans la base de données
    const newMessage = await models.Message.create({
      content: message,
      userId,
      roomId,
    });

    // Récupérer l'utilisateur pour avoir son nom
    const user = await models.User.findByPk(userId);

    // Envoyer le message à tous les utilisateurs dans la room
    io.to(roomId).emit("message", {
      id: newMessage.id,
      content: message,
      userId,
      username: user?.username,
      createdAt: newMessage.createdAt,
    });
  });

  // Gérer l'événement de frappe
  socket.on("typing", async (data: TypingEvent) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const { roomId } = data;

    // Ajouter l'utilisateur à la liste des utilisateurs qui tapent
    typingUsers.get(roomId)?.add(userId);

    // Récupérer l'utilisateur pour avoir son nom
    const user = await models.User.findByPk(userId);

    // Informer les autres utilisateurs que cet utilisateur est en train de taper
    socket.to(roomId).emit("userTyping", {
      userId,
      username: user?.username,
    });
  });

  // Gérer l'événement d'arrêt de frappe
  socket.on("stopTyping", async (data: TypingEvent) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const { roomId } = data;

    // Retirer l'utilisateur de la liste des utilisateurs qui tapent
    typingUsers.get(roomId)?.delete(userId);

    // Informer les autres utilisateurs que cet utilisateur a arrêté de taper
    socket.to(roomId).emit("userStoppedTyping", {
      userId,
    });
  });

  // Gérer la mise à jour de l'avatar
  socket.on("updateAvatar", async (data: AvatarUpdate) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;

    // Enregistrer les paramètres de l'avatar
    userAvatarSettings.set(userId, {
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
    });

    try {
      // Mettre à jour l'avatar dans la base de données (optionnel)
      const avatar = await models.Avatar.findOne({ where: { userId } });
      if (avatar) {
        await avatar.update({
          // Vous pouvez ajouter des colonnes à votre modèle Avatar pour stocker ces informations
          // backgroundColor: data.backgroundColor,
          // textColor: data.textColor
        });
      }

      // Informer les autres utilisateurs du changement
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(userId)) {
          socket.to(roomId).emit("avatarUpdated", {
            userId,
            backgroundColor: data.backgroundColor,
            textColor: data.textColor,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'avatar:", error);
    }
  });

  // Gérer les réactions
  socket.on("reaction", async (data: { roomId: string; emoji: string }) => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const { roomId, emoji } = data;

    // Récupérer l'utilisateur pour avoir son nom
    const user = await models.User.findByPk(userId);

    // Envoyer la réaction à tous les utilisateurs dans la room
    io.to(roomId).emit("userReaction", {
      userId,
      username: user?.username,
      emoji,
    });
  });

  // Gérer les changements d'état de présence
  socket.on(
    "updatePresence",
    async (data: { status: PresenceStatus; customMessage?: string }) => {
      if (!socket.data.userId) return;

      const userId = socket.data.userId;
      const { status, customMessage } = data;

      // Mettre à jour la présence
      await updateUserPresence(userId, status, customMessage);
    }
  );

  // Gérer l'activité utilisateur pour mettre à jour le statut "away"
  socket.on("userActivity", () => {
    if (!socket.data.userId) return;

    const userId = socket.data.userId;
    const presence = userPresence.get(userId);

    if (presence) {
      // Si l'utilisateur était absent, le remettre en ligne
      if (presence.status === PresenceStatus.AWAY) {
        updateUserPresence(
          userId,
          PresenceStatus.ONLINE,
          presence.customMessage
        );
      } else {
        // Sinon, juste mettre à jour l'horodatage d'activité
        presence.lastActivity = new Date();
        userPresence.set(userId, presence);
      }
    }
  });

  // Déconnexion
  socket.on("disconnect", () => {
    if (socket.data.userId) {
      const userId = socket.data.userId;

      // Supprimer l'utilisateur de la liste des utilisateurs connectés
      connectedUsers.delete(userId);

      // Supprimer l'utilisateur de toutes les rooms
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(userId)) {
          users.delete(userId);

          // Supprimer l'utilisateur de la liste des utilisateurs qui tapent
          typingUsers.get(roomId)?.delete(userId);

          // Informer les autres utilisateurs de la room que l'utilisateur est parti
          io.to(roomId).emit("userLeft", {
            userId,
          });
        }
      }

      // Mettre à jour le statut de présence à "hors ligne"
      if (userPresence.has(userId)) {
        updateUserPresence(userId, PresenceStatus.OFFLINE);
      }
    }
  });
});
