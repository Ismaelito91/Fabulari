import { Alert, Platform } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React from "react";

// URL de base de l'API (à configurer selon votre environnement)
// Pour les émulateurs Android: 10.0.2.2
// Pour les émulateurs iOS: localhost
// Pour les appareils physiques: utilisez l'adresse IP de votre machine
const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    // Émulateur Android
    return "http://10.0.2.2:3001/api";
  } else if (Platform.OS === "ios") {
    // Émulateur iOS
    return "http://localhost:3001/api";
  } else {
    // Web ou autre
    return "http://localhost:3001/api";
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Liste locale des pseudos utilisés (pour simulation sans serveur)
let usedUsernames: string[] = [];

// Fonction pour charger la liste des pseudos depuis le stockage local
export const loadUsedUsernames = async (): Promise<void> => {
  try {
    const storedUsernames = await AsyncStorage.getItem("usedUsernames");
    if (storedUsernames) {
      usedUsernames = JSON.parse(storedUsernames);
      console.log("Pseudos déjà utilisés chargés:", usedUsernames);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des pseudos utilisés:", error);
  }
};

// Charger les pseudos au démarrage
loadUsedUsernames();

// Fonction pour vérifier si un pseudo est déjà utilisé
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    // En environnement réel, faire une requête API
    // Mais ici on utilise la liste locale
    await loadUsedUsernames(); // Recharger pour avoir les données à jour

    // Vérification insensible à la casse
    return usedUsernames.some(
      (existingName) => existingName.toLowerCase() === username.toLowerCase()
    );
  } catch (error) {
    console.error("Erreur lors de la vérification du pseudo:", error);
    return false; // En cas d'erreur, on permet l'utilisation du pseudo
  }
};

// Fonction pour ajouter un pseudo à la liste des utilisés
export const addUsedUsername = async (username: string): Promise<void> => {
  try {
    if (!usedUsernames.includes(username)) {
      usedUsernames.push(username);
      await AsyncStorage.setItem(
        "usedUsernames",
        JSON.stringify(usedUsernames)
      );
      console.log("Pseudo ajouté à la liste des utilisés:", username);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du pseudo:", error);
  }
};

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log("Vérification stricte de l'authentification...");

    // Récupérer le token d'authentification
    const userToken = await AsyncStorage.getItem("userToken");

    // Si pas de token, déconnecté
    if (!userToken) {
      console.log("Aucun token trouvé - Non authentifié");
      return false;
    }

    // Récupérer les données utilisateur
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) {
      console.log("Données utilisateur absentes - Non authentifié");
      // Nettoyage par sécurité
      await AsyncStorage.removeItem("userToken");
      return false;
    }

    // Vérifier la structure du token JWT (doit avoir 3 parties: header.payload.signature)
    const tokenParts = userToken.split(".");
    if (tokenParts.length !== 3) {
      console.log("Format de token invalide - Non authentifié");
      // Nettoyer ce token invalide
      await logout();
      return false;
    }

    // Vérifier si le token est un token de développement
    if (userToken === "temp-token-for-testing") {
      console.log("Token de développement accepté");
      return true;
    }

    // Pour les JWT standards, vérifier sommairement le payload
    try {
      // Décoder la partie payload (2ème partie) du token
      const payloadBase64 = tokenParts[1];
      // Conversion base64url en base64 standard
      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      // Décoder et parser en JSON
      const payload = JSON.parse(atob(base64));

      // Vérifier si le token a une date d'expiration
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();

        if (now > expirationDate) {
          console.log("Token expiré:", expirationDate, "- Déconnexion");
          await logout();
          return false;
        }
      }

      console.log("Payload du token valide");
    } catch (e) {
      console.error("Erreur lors de l'analyse du payload du token:", e);
      // En cas d'erreur, on continue quand même pour compatibilité
    }

    // Si tout est OK, configurer l'en-tête d'autorisation
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;

    console.log("Utilisateur authentifié avec succès");
    return true;
  } catch (error) {
    console.error(
      "Erreur critique lors de la vérification d'authentification:",
      error
    );
    return false;
  }
};

// Version synchrone pour une utilisation simple dans les composants
export const isAuthenticatedSync = (): boolean => {
  // Cette fonction est moins précise mais permet une utilisation plus simple
  // dans des contextes où les promesses sont difficiles à gérer
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);

  React.useEffect(() => {
    isAuthenticated().then((result) => setIsLoggedIn(result));
  }, []);

  return isLoggedIn;
};

// Fonction pour effacer complètement toutes les données d'authentification
// Utile pour déboguer ou réinitialiser l'état
export const clearAllAuthData = async (): Promise<void> => {
  try {
    // Supprimer le token
    await AsyncStorage.removeItem("userToken");

    // Supprimer les données utilisateur
    await AsyncStorage.removeItem("userData");

    // Supprimer la liste des pseudos (optionnel)
    await AsyncStorage.removeItem("usedUsernames");

    console.log("Toutes les données d'authentification ont été effacées");

    // Afficher une confirmation
    Alert.alert(
      "Déconnexion complète",
      "Toutes les données d'authentification ont été effacées."
    );
  } catch (error) {
    console.error("Erreur lors de l'effacement des données:", error);
  }
};

// Fonction pour se connecter
export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    console.log("Tentative de connexion avec:", { email });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Réponse du serveur:", response);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erreur inconnue" }));
        console.error("Erreur de connexion:", errorData);
        // Ne pas afficher d'alerte ici, on va essayer le mode factice
        throw new Error("Serveur indisponible ou erreur");
      }

      const data = await response.json();
      console.log("Données de connexion:", data);

      // Stocker le token si présent dans la réponse
      if (data && data.token) {
        // Stocker le token dans AsyncStorage
        await AsyncStorage.setItem("userToken", data.token);

        // Stocker les infos utilisateur si nécessaire
        if (data.user) {
          // S'assurer que l'utilisateur a un nom
          if (!data.user.name && data.user.username) {
            data.user.name = data.user.username;
          }

          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          console.log(
            "Données utilisateur stockées après connexion:",
            data.user
          );
        } else {
          // Si le serveur n'a pas renvoyé de données utilisateur, essayer de les récupérer
          try {
            // Configurer l'en-tête d'autorisation
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${data.token}`;

            // Récupérer les informations utilisateur
            const userResponse = await axios.get(`${API_BASE_URL}/auth/me`);

            if (userResponse.data && userResponse.data.user) {
              const userData = userResponse.data.user;

              // S'assurer que l'utilisateur a un nom
              if (!userData.name && userData.username) {
                userData.name = userData.username;
              }

              await AsyncStorage.setItem("userData", JSON.stringify(userData));
              console.log(
                "Données utilisateur récupérées après connexion:",
                userData
              );
            }
          } catch (userError) {
            console.error(
              "Erreur lors de la récupération des données utilisateur:",
              userError
            );
            // Si on ne peut pas récupérer les données, créer un minimum
            const minimalUserData = {
              id: `user-${Date.now()}`,
              name: email.split("@")[0], // Utiliser la partie locale de l'email comme pseudo par défaut
              email: email,
            };
            await AsyncStorage.setItem(
              "userData",
              JSON.stringify(minimalUserData)
            );
          }
        }
        return true;
      } else {
        // Ne pas afficher d'alerte ici, on va essayer le mode factice
        throw new Error("Données de connexion invalides");
      }
    } catch (error) {
      console.warn(
        "Serveur API non disponible, utilisation du mode factice pour le développement"
      );
    }

    // Mode factice pour le développement (connexion simulée)
    // Vérification factice des identifiants (à modifier selon vos besoins)
    if (email && password.length >= 6) {
      console.log("Mode factice activé - Connexion simulée réussie");

      // Créer un token temporaire pour les tests
      await AsyncStorage.setItem("userToken", "temp-token-for-testing");

      // Stocker des informations minimales sur l'utilisateur
      const [username] = email.split("@");
      const tempUserData = {
        id: `user-${Date.now()}`,
        name: username || "Utilisateur",
        email: email,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("userData", JSON.stringify(tempUserData));
      console.log("Données utilisateur factices stockées:", tempUserData);

      return true;
    } else {
      Alert.alert("Erreur de connexion", "Email ou mot de passe incorrect", [
        { text: "OK" },
      ]);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);

    // Message d'erreur plus détaillé et spécifique
    let errorMessage = "Impossible de se connecter au serveur";
    if (error instanceof Error) {
      if (
        error.message.includes("Network request failed") ||
        error.message.includes("timed out") ||
        error.message.includes("ERR_CONNECTION")
      ) {
        errorMessage =
          "Impossible de joindre le serveur. Vérifiez votre connexion et l'état du serveur d'API.";
      } else {
        errorMessage = `Erreur: ${error.message}`;
      }
    }

    Alert.alert("Problème de connexion", errorMessage, [
      {
        text: "Voir plus",
        onPress: () =>
          Alert.alert(
            "Détails techniques",
            `URL: ${API_BASE_URL}/auth/login\n` +
              `Erreur: ${
                error instanceof Error ? error.toString() : String(error)
              }\n\n` +
              "Assurez-vous que votre serveur d'API fonctionne sur le port 3001"
          ),
      },
      { text: "OK" },
    ]);

    return false;
  }
};

// Fonction pour s'inscrire
export const register = async (
  name: string,
  email: string,
  password: string,
  avatarType: string = "boy" // "boy" ou "girl"
): Promise<boolean> => {
  try {
    console.log("Tentative d'inscription avec:", {
      username: name,
      email,
      avatarType,
    });

    // Vérifier si le pseudo est déjà utilisé
    const usernameTaken = await isUsernameTaken(name);
    if (usernameTaken) {
      Alert.alert(
        "Pseudo déjà utilisé",
        "Ce pseudo est déjà utilisé par un autre utilisateur. Veuillez en choisir un autre."
      );
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
          avatar: {
            type: avatarType,
            // Valeurs par défaut pour l'avatar
            hair: "default",
            face: "default",
            outfit: "default",
          },
        }),
      });

      console.log("Réponse du serveur:", response);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erreur inconnue" }));
        console.error("Erreur d'inscription:", errorData);
        // Pas d'alerte ici, on va essayer le mode factice
        throw new Error("Serveur indisponible ou erreur");
      }

      const data = await response.json();
      console.log("Données d'inscription:", data);

      // Stocker le token si présent dans la réponse
      if (data && data.token) {
        await AsyncStorage.setItem("userToken", data.token);

        // Stocker les informations de l'utilisateur même si le serveur ne les renvoie pas
        const userData = data.user || {
          id: data.userId || "temp-user-id",
          name: name, // S'assurer que le nom est bien stocké
          email: email,
          avatar: {
            type: avatarType,
            // Autres propriétés par défaut
            hair: "default",
            face: "default",
            outfit: "default",
          },
          createdAt: new Date().toISOString(),
        };

        // S'assurer que userData contient bien le nom
        if (!userData.name) {
          userData.name = name;
        }

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        console.log("Données utilisateur stockées:", userData);

        // Ajouter le pseudo à la liste des utilisés
        await addUsedUsername(name);

        return true;
      }
    } catch (error) {
      console.warn(
        "Serveur API non disponible, utilisation du mode factice pour le développement"
      );
    }

    // Mode factice pour le développement
    console.log("Mode factice activé - Inscription simulée");

    // Créer un token temporaire pour les tests
    await AsyncStorage.setItem("userToken", "temp-token-for-testing");

    // Stocker des informations minimales sur l'utilisateur
    const tempUserData = {
      id: `user-${Date.now()}`,
      name: name, // S'assurer que le nom est bien stocké
      email: email,
      avatar: {
        type: avatarType,
        hair: "default",
        face: "default",
        outfit: "default",
      },
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem("userData", JSON.stringify(tempUserData));
    console.log("Données utilisateur factices stockées:", tempUserData);

    // Ajouter le pseudo à la liste des utilisés
    await addUsedUsername(name);

    // Succès en mode factice
    return true;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);

    // Message d'erreur plus détaillé et spécifique
    let errorMessage = "Impossible de se connecter au serveur";
    if (error instanceof Error) {
      if (
        error.message.includes("Network request failed") ||
        error.message.includes("timed out") ||
        error.message.includes("ERR_CONNECTION")
      ) {
        errorMessage =
          "Impossible de joindre le serveur. Vérifiez votre connexion et l'état du serveur d'API.";
      } else {
        errorMessage = `Erreur: ${error.message}`;
      }
    }

    Alert.alert("Problème de connexion", errorMessage, [
      {
        text: "Voir plus",
        onPress: () =>
          Alert.alert(
            "Détails techniques",
            `URL: ${API_BASE_URL}/auth/register\n` +
              `Erreur: ${
                error instanceof Error ? error.toString() : String(error)
              }\n\n` +
              "Assurez-vous que votre serveur d'API fonctionne sur le port 3001"
          ),
      },
      { text: "OK" },
    ]);

    return false;
  }
};

// Fonction pour se déconnecter
export const logout = async (): Promise<boolean> => {
  try {
    console.log("DÉCONNEXION RADICALE EN COURS...");

    // Récupérer le token avant de le supprimer pour l'appel API
    const token = await AsyncStorage.getItem("userToken");

    // Solution radicale: vider complètement AsyncStorage
    await AsyncStorage.clear();
    console.log("AsyncStorage complètement vidé");

    // Supprimer l'en-tête d'autorisation
    delete axios.defaults.headers.common["Authorization"];
    console.log("En-tête d'autorisation supprimé");

    // Forcer un rafraîchissement des données
    usedUsernames = [];
    console.log("Variables locales réinitialisées");

    // Essayer d'appeler l'API de déconnexion côté serveur si on a le token
    if (token) {
      try {
        console.log("Tentative de déconnexion côté serveur...");
        // On essaie malgré tout d'informer le serveur, sans attendre la réponse
        fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch((e) => console.log("Erreur déconnexion serveur:", e.message));
      } catch (serverError) {
        console.log("Échec de déconnexion côté serveur:", serverError);
        // On continue même si cette partie échoue
      }
    }

    // Afficher un message de confirmation
    Alert.alert(
      "Déconnexion réussie",
      "Vous avez été déconnecté avec succès. L'application va maintenant redémarrer.",
      [
        {
          text: "OK",
          onPress: () => {
            // Simuler un redémarrage en rafraîchissant la navigation
            console.log("Redémarrage de l'application recommandé");
          },
        },
      ]
    );

    return true;
  } catch (error) {
    console.error("ERREUR CRITIQUE LORS DE LA DÉCONNEXION:", error);

    Alert.alert(
      "Erreur critique",
      "Une erreur est survenue lors de la déconnexion. Veuillez redémarrer l'application manuellement.",
      [{ text: "OK" }]
    );

    return false;
  }
};

// Fonction pour rediriger vers la connexion avec un message si nécessaire
export const requireAuth = async (
  navigation: StackNavigationProp<RootStackParamList>,
  featureName: string = "cette fonctionnalité"
): Promise<boolean> => {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    Alert.alert(
      "Connexion requise",
      `Vous devez être connecté pour accéder à ${featureName}.`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Se connecter", onPress: () => navigation.navigate("Login") },
      ]
    );
    return false;
  }
  return true;
};

// Fonction simplifiée pour accéder aux salons de chat
export const accessChatRoom = async (
  navigation: StackNavigationProp<RootStackParamList>,
  roomId: string | number,
  roomName: string
): Promise<void> => {
  const canAccess = await requireAuth(navigation, `au salon "${roomName}"`);

  if (canAccess) {
    try {
      // Naviguer vers le salon de chat
      navigation.navigate("ChatRoom", { roomId, roomName });
    } catch (error) {
      console.error("Erreur d'accès au salon:", error);
      Alert.alert("Erreur", "Impossible d'accéder à ce salon pour le moment.");
    }
  }
};

// Fonction pour configurer l'en-tête d'autorisation avec le token JWT
export const setupAuthorizationHeader = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      console.log(
        "Configuration de l'en-tête d'autorisation avec le token JWT"
      );

      // Définir le token pour toutes les futures requêtes
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Vérifier que l'en-tête est bien configuré
      console.log(
        "Vérification de l'en-tête d'autorisation:",
        axios.defaults.headers.common["Authorization"]
      );

      // Vérifier le format et la validité du token
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3 && token !== "temp-token-for-testing") {
        console.warn(
          "Format de token JWT invalide - Tentative de déconnexion automatique"
        );
        await logout();
        return;
      }

      // En cas de token de développement, afficher un message spécial
      if (token === "temp-token-for-testing") {
        console.log("Mode développement détecté - Token de test utilisé");
        // Ne pas essayer de valider ce token
        return;
      }

      // Contourner temporairement les problèmes d'authentification côté serveur
      if (token.length > 0) {
        console.log("Token valide détecté, authentification activée");
      }
    } else {
      console.log(
        "Aucun token d'authentification trouvé - Nettoyage des en-têtes"
      );
      delete axios.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    console.error(
      "Erreur lors de la configuration de l'en-tête d'autorisation:",
      error
    );
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Appeler cette fonction au démarrage
setupAuthorizationHeader();

// Fonction pour vérifier et renouveler le token si nécessaire
export const checkAndRefreshToken = async (): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est authentifié
    const auth = await isAuthenticated();
    if (!auth) {
      console.log(
        "L'utilisateur n'est pas authentifié, aucun renouvellement nécessaire"
      );
      return;
    }

    // Récupérer le token existant
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.log("Aucun token trouvé pour le renouvellement");
      return;
    }

    // En production, on pourrait appeler l'API pour vérifier/renouveler le token
    // const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`);
    // if (response.data && response.data.token) {
    //   await AsyncStorage.setItem("userToken", response.data.token);
    //   setupAuthorizationHeader();
    // }
  } catch (error) {
    console.error("Erreur lors du renouvellement du token:", error);
  }
};

// Intercepteur pour déboguer les requêtes API
axios.interceptors.request.use(
  async (config) => {
    // Afficher les headers de la requête pour le débogage
    console.log("Requête API vers:", config.url);
    console.log("En-têtes envoyés:", JSON.stringify(config.headers));

    // Si pas d'en-tête d'autorisation, essayer de le récupérer à nouveau
    if (!config.headers.Authorization) {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        console.log("Ajout de l'en-tête d'autorisation manquant");
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("Erreur de configuration de la requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axios.interceptors.response.use(
  (response) => {
    console.log(`Réponse de ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `Erreur API ${error.response.status} pour ${error.config?.url}:`,
        error.response.data
      );

      // Si Unauthorized (401), vérifier l'état du token
      if (error.response.status === 401) {
        console.warn("Erreur 401 - Vérification de l'authentification");

        // Vérifier l'état du token de manière asynchrone
        setTimeout(async () => {
          const token = await AsyncStorage.getItem("userToken");
          console.log("État actuel du token:", token ? "Présent" : "Absent");

          // Si le token existe mais est rejeté, forcer la déconnexion
          if (token) {
            console.warn(
              "Token présent mais rejeté par le serveur - Déconnexion forcée"
            );
            // Décommenter la ligne suivante pour forcer la déconnexion en cas de token invalide
            // logout();
          }
        }, 0);
      }
    }
    return Promise.reject(error);
  }
);

// Fonction pour nettoyer complètement le cache de l'application
export const clearAppCache = async (): Promise<boolean> => {
  try {
    console.log("NETTOYAGE COMPLET DU CACHE EN COURS...");

    // 1. Vider complètement AsyncStorage
    await AsyncStorage.clear();
    console.log("AsyncStorage complètement vidé");

    // 2. Réinitialiser les en-têtes de requêtes
    delete axios.defaults.headers.common["Authorization"];
    console.log("En-têtes HTTP réinitialisés");

    // 3. Réinitialiser les variables locales
    usedUsernames = [];
    console.log("Variables locales réinitialisées");

    // 4. Réinitialiser le cache des requêtes Axios
    if (axios.interceptors && axios.interceptors.request) {
      // Réinitialiser uniquement si nécessaire
      console.log("Cache des requêtes réinitialisé");
    }

    // 5. Informer l'utilisateur
    Alert.alert(
      "Cache effacé",
      "Toutes les données temporaires ont été supprimées. L'application doit maintenant être redémarrée pour appliquer les changements.",
      [
        {
          text: "OK",
          onPress: () => {
            console.log("Redémarrage de l'application recommandé");
            // Ici, dans une vraie app, on pourrait ajouter du code pour forcer un redémarrage
          },
        },
      ]
    );

    return true;
  } catch (error) {
    console.error("ERREUR LORS DU NETTOYAGE DU CACHE:", error);

    Alert.alert(
      "Erreur",
      "Une erreur est survenue lors du nettoyage du cache. Veuillez essayer de redémarrer l'application manuellement.",
      [{ text: "OK" }]
    );

    return false;
  }
};

// Fonction pour aider au débogage de l'authentification
export const debugAuthentication = async (): Promise<void> => {
  console.log("=== DÉBOGAGE DE L'AUTHENTIFICATION ===");

  try {
    // Vérifier les données stockées
    const allKeys = await AsyncStorage.getAllKeys();
    console.log("Clés AsyncStorage:", allKeys);

    const userToken = await AsyncStorage.getItem("userToken");
    console.log("Token:", userToken ? "Présent" : "Absent");

    const userData = await AsyncStorage.getItem("userData");
    console.log(
      "Données utilisateur:",
      userData ? JSON.parse(userData) : "Absentes"
    );

    // Vérifier les en-têtes HTTP
    console.log(
      "En-tête d'autorisation:",
      axios.defaults.headers.common["Authorization"] || "Non défini"
    );

    // Afficher une alerte avec le résumé
    Alert.alert(
      "Informations de débogage",
      `Nombre de clés stockées: ${allKeys.length}\n` +
        `Token: ${userToken ? "Présent" : "Absent"}\n` +
        `Données utilisateur: ${userData ? "Présentes" : "Absentes"}\n` +
        `En-tête HTTP: ${
          axios.defaults.headers.common["Authorization"]
            ? "Défini"
            : "Non défini"
        }`,
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Erreur lors du débogage:", error);
  }
};

// Fonction pour tester manuellement l'API et comprendre le problème d'authentification
export const testBackendConnection = async (): Promise<void> => {
  try {
    console.log("Test de connexion au backend...");

    // 1. Récupérer le token actuel
    const token = await AsyncStorage.getItem("userToken");
    console.log(
      "Token actuel:",
      token ? "Présent" : "Absent",
      token?.substring(0, 20) + "..."
    );

    // 2. Récupérer les données utilisateur
    const userData = await AsyncStorage.getItem("userData");
    console.log(
      "Données utilisateur:",
      userData ? JSON.parse(userData) : "Absentes"
    );

    // Essayer différents endpoints pour diagnostiquer le problème
    try {
      // 3. Essayer une requête sans authentification
      const publicResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log(
        "Réponse publique:",
        publicResponse.status,
        publicResponse.data
      );
    } catch (e: any) {
      console.log("Erreur API publique:", e.response?.status, e.response?.data);
    }

    // 4. Essayer une requête avec authentification
    if (token) {
      try {
        const authResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(
          "Réponse authentifiée:",
          authResponse.status,
          authResponse.data
        );
      } catch (e: any) {
        console.log(
          "Erreur API authentifiée:",
          e.response?.status,
          e.response?.data
        );

        // 5. Si erreur 401, essayer de décoder le token pour comprendre le problème
        if (e.response?.status === 401) {
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const base64Payload = tokenParts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
              const payload = JSON.parse(atob(base64Payload));
              console.log("Contenu du token:", payload);
              console.log(
                "Date d'expiration:",
                payload.exp
                  ? new Date(payload.exp * 1000).toLocaleString()
                  : "Non spécifiée"
              );
              console.log(
                "ID Utilisateur dans le token:",
                payload.userId || payload.user_id || payload.sub || "Non trouvé"
              );
            }
          } catch (decodeError) {
            console.error("Erreur lors du décodage du token:", decodeError);
          }
        }
      }
    }

    Alert.alert(
      "Diagnostique Backend",
      "Test de connexion terminé. Consultez la console pour les détails.",
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Erreur globale de test:", error);
    Alert.alert(
      "Erreur",
      "Impossible de tester la connexion. Vérifiez que le serveur est démarré.",
      [{ text: "OK" }]
    );
  }
};

// Fonction pour vérifier l'état du serveur
export const checkServerStatus = async (): Promise<void> => {
  try {
    console.log("Vérification de l'état du serveur...");

    // Routes à vérifier
    const routes = [
      { url: `${API_BASE_URL}/health`, name: "Health Check" },
      { url: `${API_BASE_URL}/auth/status`, name: "Auth Status" },
      { url: `${API_BASE_URL}/rooms/public`, name: "Public Rooms" },
    ];

    let results = "Résultats des tests serveur:\n\n";

    // Tester chaque route
    for (const route of routes) {
      try {
        const start = Date.now();
        const response = await fetch(route.url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const time = Date.now() - start;

        const status = response.status;
        let content = "N/A";

        try {
          content = await response.text();
          if (content && content.length > 100) {
            content = content.substring(0, 100) + "...";
          }
        } catch (e) {
          content = "Impossible de lire la réponse";
        }

        results += `${route.name}: ${status} (${time}ms)\n${content}\n\n`;
        console.log(`Route ${route.name}:`, status, time + "ms");
      } catch (error: any) {
        results += `${route.name}: ERREUR - ${error.message}\n\n`;
        console.error(`Erreur sur ${route.name}:`, error.message);
      }
    }

    // Afficher le résultat dans une alerte
    Alert.alert(
      "État du Serveur",
      "Vérifications terminées. Consultez la console pour plus de détails.",
      [{ text: "OK" }]
    );

    console.log(results);
  } catch (error) {
    console.error("Erreur lors de la vérification du serveur:", error);
    Alert.alert(
      "Erreur",
      "Impossible de vérifier l'état du serveur. Vérifiez votre connexion.",
      [{ text: "OK" }]
    );
  }
};

// Fonction pour gérer les erreurs d'authentification et rediriger
export const handleAuthError = (status: number, navigation?: any): boolean => {
  // Si c'est une erreur 401 (non autorisé)
  if (status === 401) {
    console.warn("Erreur 401 détectée - Token invalide ou expiré");

    // Effacer les données d'authentification locales
    AsyncStorage.removeItem("userToken")
      .then(() => AsyncStorage.removeItem("userData"))
      .then(() => {
        console.log("Données d'authentification effacées suite à erreur 401");

        // Si nous avons accès à la navigation, rediriger vers Login
        if (navigation) {
          // Afficher une alerte pour informer l'utilisateur
          Alert.alert(
            "Session expirée",
            "Votre session a expiré ou n'est plus valide. Veuillez vous reconnecter.",
            [
              {
                text: "Se connecter",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }, { name: "Login" }],
                  });
                },
              },
            ]
          );
        }
      })
      .catch((err) =>
        console.error("Erreur lors du nettoyage des données:", err)
      );

    return true; // Indique que l'erreur a été gérée
  }

  return false; // Indique que ce n'était pas une erreur d'authentification
};

// Fonction pour diagnostiquer et contourner les erreurs serveur
export const getWorkingApiEndpoint = async (
  path: string,
  method: string = "GET",
  token?: string | null,
  body?: string,
  navigation?: any
): Promise<Response> => {
  console.log(`Tentative d'accès à l'API (${method}): ${API_BASE_URL}${path}`);

  // Liste des alternatives d'URL à essayer en cas d'échec
  const alternativeUrls = [
    `${API_BASE_URL}${path}`, // URL originale
    `http://localhost:3001/api${path}`, // Force localhost
    `http://127.0.0.1:3001/api${path}`, // Utiliser IP locale
  ];

  let lastError: any = null;

  // Essayer chaque URL jusqu'à ce qu'une fonctionne
  for (const url of alternativeUrls) {
    try {
      console.log(`Essai de connexion à: ${url}`);

      const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Ajouter le token d'authentification si disponible
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Créer un contrôleur d'abandon avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const fetchOptions: RequestInit = {
        method,
        headers,
        // Désactiver les restrictions CORS en mode développement
        mode: "cors",
        // Un timeout en utilisant le signal d'abandon
        signal: controller.signal,
      };

      // Ajouter le corps de la requête si nécessaire (pour POST, PUT, etc.)
      if (
        body &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        fetchOptions.body = body;
      }

      const response = await fetch(url, fetchOptions);

      // Nettoyer le timeout
      clearTimeout(timeoutId);

      console.log(`Réponse de ${url}: ${response.status}`);

      // Vérifier si c'est une erreur d'authentification
      if (response.status === 401) {
        // Gérer l'erreur d'authentification
        handleAuthError(response.status, navigation);
        return response; // Retourner la réponse quand même pour traitement spécifique
      }

      // Si le code de statut n'est pas une erreur serveur (500), retourner la réponse
      if (response.status !== 500) {
        // Si la réponse est réussie, mémoriser cette URL comme fonctionnelle
        if (response.ok) {
          console.log(`API fonctionnelle trouvée: ${url}`);
        }
        return response;
      }

      // Si on a une erreur 500, continuer avec l'URL suivante
      lastError = new Error(`Erreur serveur (500) pour ${url}`);
    } catch (error) {
      console.error(`Échec de connexion à ${url}:`, error);
      lastError = error;
      // Continuer avec l'URL suivante
    }
  }

  // Si aucune URL ne fonctionne, lancer la dernière erreur
  throw lastError || new Error("Impossible de se connecter au serveur");
};
