import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

/**
 * Vérifie si l'utilisateur est authentifié en vérifiant le token dans AsyncStorage
 * @returns {Promise<boolean>} True si l'utilisateur est authentifié, false sinon
 */
export const isAuthenticated = async () => {
  try {
    // Récupérer le token d'authentification
    const token = await AsyncStorage.getItem("userToken");

    // Aucun token = non authentifié
    if (!token) {
      console.log("Aucun token trouvé - Utilisateur non authentifié");
      return false;
    }

    // Récupérer les données utilisateur
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) {
      console.log("Données utilisateur non trouvées - Déconnexion forcée");
      // Supprimer le token si les données utilisateur sont absentes
      await AsyncStorage.removeItem("userToken");
      return false;
    }

    // Vérification supplémentaire de la validité du token
    // On vérifie si le token contient le préfixe attendu et n'est pas expiré
    if (token.startsWith("fake_jwt_token_") || token.startsWith("dev_token_")) {
      // Vérifier si le token n'est pas trop ancien (24h max)
      const tokenTimestamp = parseInt(token.split("_").pop());
      const currentTime = Date.now();
      const tokenAge = currentTime - tokenTimestamp;

      // Si le token a plus de 24h (86400000 ms), on le considère expiré
      if (tokenAge > 86400000) {
        console.log("Token expiré - Déconnexion forcée");
        await logout(); // Forcer la déconnexion si le token est expiré
        return false;
      }

      console.log("Utilisateur authentifié avec un token valide");
      return true;
    }

    console.log("Token invalide - Déconnexion forcée");
    await logout(); // Forcer la déconnexion si le token n'a pas le bon format
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error);
    await logout(); // Forcer la déconnexion en cas d'erreur
    return false;
  }
};

/**
 * Récupère les informations utilisateur depuis AsyncStorage
 * @returns {Promise<Object|null>} Les informations utilisateur ou null
 */
export const getUserData = async () => {
  try {
    const userDataStr = await AsyncStorage.getItem("userData");
    return userDataStr ? JSON.parse(userDataStr) : null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur:",
      error
    );
    return null;
  }
};

/**
 * Enregistre le token et les données utilisateur dans AsyncStorage
 * @param {string} token - Le token JWT
 * @param {Object} userData - Les données utilisateur
 * @returns {Promise<boolean>} True si l'enregistrement est réussi
 */
export const saveAuthData = async (token, userData) => {
  try {
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement des données d'authentification:",
      error
    );
    return false;
  }
};

/**
 * Supprime les données d'authentification (déconnexion)
 * @returns {Promise<boolean>} True si la suppression est réussie
 */
export const logout = async () => {
  try {
    console.log("DÉBUT DE LA DÉCONNEXION");

    // Méthode 1: Supprimer les clés spécifiques
    const keysToRemove = ["userToken", "userData", "refreshToken"];

    for (const key of keysToRemove) {
      console.log(`Suppression de la clé: ${key}`);
      await AsyncStorage.removeItem(key);
    }

    // Méthode 2: Vérification que les clés sont réellement supprimées
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken) {
      console.warn("Le token n'a pas été supprimé, nouvelle tentative");
      await AsyncStorage.removeItem("userToken");

      // Vérification finale
      const tokenCheck = await AsyncStorage.getItem("userToken");
      if (tokenCheck) {
        console.error("Échec critique: Impossible de supprimer le token");
        // Option nucléaire si on n'arrive pas à supprimer le token
        await AsyncStorage.clear();
      }
    }

    // Vérifier que les données utilisateur sont supprimées
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      console.warn(
        "Les données utilisateur n'ont pas été supprimées, nouvelle tentative"
      );
      await AsyncStorage.removeItem("userData");
    }

    // Méthode 3: Nettoyage du header d'authentification
    if (axios.defaults.headers.common["Authorization"]) {
      console.log("Nettoyage des en-têtes d'autorisation");
      delete axios.defaults.headers.common["Authorization"];
    }

    // Vérification finale globale
    const allKeys = await AsyncStorage.getAllKeys();
    const authKeys = allKeys.filter(
      (key) =>
        key === "userToken" || key === "userData" || key === "refreshToken"
    );

    if (authKeys.length > 0) {
      console.warn(
        "Certaines clés d'authentification persistent, nettoyage complet"
      );
      await AsyncStorage.multiRemove(authKeys);
    }

    console.log("DÉCONNEXION RÉUSSIE");
    return true;
  } catch (error) {
    console.error("ERREUR LORS DE LA DÉCONNEXION:", error);

    try {
      // Option nucléaire: effacer tout le stockage
      console.warn("Tentative de nettoyage complet du stockage");
      await AsyncStorage.clear();
      console.log("Nettoyage complet effectué");
      return true;
    } catch (e) {
      console.error("ÉCHEC CRITIQUE DE DÉCONNEXION:", e);
      return false;
    }
  }
};

/**
 * Supprime le compte utilisateur et toutes ses données
 * @returns {Promise<boolean>} True si la suppression est réussie
 */
export const deleteAccount = async () => {
  try {
    // Comme nous n'avons pas encore la route backend pour supprimer le compte,
    // nous allons simplement effectuer une déconnexion pour le moment
    console.log("Suppression du compte (simulée pour le moment)");

    // Effectuer la déconnexion
    await logout();

    // Normalement ici on appellerait l'API pour supprimer le compte
    // Mais comme elle n'existe pas encore, on simule une réussite
    return true;
  } catch (error) {
    console.error("Erreur critique lors de la suppression du compte:", error);
    return false;
  }
};

/**
 * Vérifie si un nom d'utilisateur est déjà utilisé
 * @param {string} username - Le nom d'utilisateur à vérifier
 * @returns {Promise<boolean>} True si le nom est déjà pris
 */
export const isUsernameTaken = async (username) => {
  // Simuler une vérification (à remplacer par un appel API dans une app réelle)
  return false;
};

/**
 * Ajoute un nom d'utilisateur à la liste des noms utilisés
 * @param {string} username - Le nom d'utilisateur à ajouter
 */
export const addUsedUsername = async (username) => {
  // Dans une app réelle, cela serait géré par le backend
  console.log(`Nouveau nom d'utilisateur ajouté: ${username}`);
};

/**
 * Connecte un utilisateur avec son email et mot de passe
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {Promise<boolean>} True si la connexion est réussie
 */
export const login = async (email, password) => {
  try {
    console.log("Tentative de connexion pour:", email);

    // Normalement, faire une requête au backend
    // Mais pour le développement, on utilise des valeurs statiques
    if (email === "test@example.com" && password === "password123") {
      // Simuler un token JWT
      const fakeToken = "fake_jwt_token_" + Date.now();

      // Simuler des données utilisateur
      const userData = {
        id: "1",
        name: "Utilisateur Test",
        email: email,
      };

      // Enregistrer le token et les données utilisateur
      await saveAuthData(fakeToken, userData);

      console.log("Connexion réussie!");
      return true;
    }

    // En mode développement, accepter n'importe quelle combinaison
    // ATTENTION: À supprimer en production!
    if (process.env.NODE_ENV === "development") {
      console.log("Mode développement: accepte toutes les connexions");

      const fakeToken = "dev_token_" + Date.now();
      const userData = {
        id: "dev_user",
        name: "Développeur",
        email: email,
      };

      await saveAuthData(fakeToken, userData);
      return true;
    }

    console.log("Échec de connexion: identifiants incorrects");
    return false;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return false;
  }
};
