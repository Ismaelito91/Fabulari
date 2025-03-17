const jwt = require("jsonwebtoken");
const { User } = require("../src/models");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Accès non autorisé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur associé au token
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    // Attacher l'utilisateur à l'objet request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré." });
    }
    console.error("Erreur dans authMiddleware:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = authMiddleware;
