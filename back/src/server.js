const express = require("express");
const cors = require("cors");
const { sequelize, testConnection } = require("./config/database");
const User = require("./models/User"); // Importez le modèle User
require("dotenv").config();
const models = require("./models");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Importation des routes
const authRoutes = require("../routes/authRoutes");
const roomRoutes = require("../routes/roomRoutes");
const chatRoutes = require("../routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Synchronisation de la base de données
const syncDatabase = async () => {
  try {
    // Force: true va supprimer et recréer les tables
    await sequelize.sync({ force: true });
    console.log("✅ Base de données synchronisée avec succès");

    // Données de test
    const testUser = await models.User.create({
      username: "test_user",
      email: "test@example.com",
      password: "password123",
    });

    await models.Avatar.create({
      userId: testUser.id,
      hair: "brown",
      face: "default",
      eyes: "blue",
      outfit: "casual",
    });

    console.log("✅ Données de test créées");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    console.error("Détails de l'erreur:", error.message);
    // Afficher plus de détails pour aider au débogage
    if (error.errors) {
      console.error("Erreurs spécifiques:", error.errors);
    }
  }
};

// Test de la connexion et synchronisation
const initializeDatabase = async () => {
  try {
    await testConnection();
    await syncDatabase();
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
};

// Initialiser la base de données mais ne pas bloquer le démarrage du serveur
initializeDatabase();

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", chatRoutes);

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Fabulari" });
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "..")));

// Route spécifique pour le fichier de test
app.get("/socket-test", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "test.html"));
});

// Configuration de Socket.IO
io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté:", socket.id);

  // Rejoindre une room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  // Recevoir et diffuser un message
  socket.on("send_message", (messageData) => {
    io.to(messageData.roomId).emit("receive_message", messageData);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur est survenue !" });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
