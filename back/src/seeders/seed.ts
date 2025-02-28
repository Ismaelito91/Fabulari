import bcrypt from "bcryptjs";
import db from "../models";

const seedDatabase = async () => {
  try {
    // Créer des utilisateurs
    const password = await bcrypt.hash("password123", 10);

    const user1 = await db.User.create({
      username: "alice",
      email: "alice@example.com",
      password,
    });

    const user2 = await db.User.create({
      username: "bob",
      email: "bob@example.com",
      password,
    });

    // Créer des avatars
    await db.Avatar.create({
      userId: user1.id,
      hair: "blonde",
      face: "round",
      eyes: "blue",
      outfit: "casual",
      currentX: 100,
      currentY: 150,
    });

    await db.Avatar.create({
      userId: user2.id,
      hair: "brown",
      face: "square",
      eyes: "green",
      outfit: "formal",
      currentX: 200,
      currentY: 250,
    });

    // Créer une room
    const room = await db.Room.create({
      name: "Salon principal",
      description: "Bienvenue dans le salon principal de Fabulari",
      backgroundImage: "library.jpg",
      maxPlayers: 20,
    });

    // Créer des messages
    await db.Message.create({
      userId: user1.id,
      roomId: room.id,
      content: "Bonjour tout le monde !",
    });

    await db.Message.create({
      userId: user2.id,
      roomId: room.id,
      content: "Salut Alice, comment ça va ?",
    });

    console.log("✅ Base de données peuplée avec succès");
  } catch (error) {
    console.error("❌ Erreur lors du peuplement de la base de données:", error);
  }
};

// Exécuter le script
seedDatabase();
