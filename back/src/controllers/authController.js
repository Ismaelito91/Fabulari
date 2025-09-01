const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Avatar } = require("../models");
require("dotenv").config();

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Créer un avatar par défaut pour l'utilisateur
    await Avatar.create({
      userId: user.id,
      hair: "brown",
      face: "default",
      eyes: "blue",
      outfit: "casual",
    });

    // Générer un token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

// Récupérer le profil de l'utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [Avatar],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    await User.update({ username, email }, { where: { id: req.user.id } });

    res.status(200).json({ message: "Profil mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Mettre à jour l'avatar de l'utilisateur
exports.updateAvatar = async (req, res) => {
  try {
    const { hair, face, eyes, outfit } = req.body;

    await Avatar.update(
      { hair, face, eyes, outfit },
      { where: { userId: req.user.id } }
    );

    res.status(200).json({ message: "Avatar mis à jour avec succès." });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
