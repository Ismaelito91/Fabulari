const express = require("express");
const cors = require("cors");
const { sequelize, testConnection } = require("./config/database");
const User = require("./models/User"); // Importez le modèle User
require("dotenv").config();
const models = require("./models");

const app = express();

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
  }
};

// Test de la connexion et synchronisation
const initializeDatabase = async () => {
  await testConnection();
  await syncDatabase();
};

initializeDatabase();

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Fabulari" });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur est survenue !" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
