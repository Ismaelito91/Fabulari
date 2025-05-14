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

const API_BASE_URL = getApiBaseUrl();

// Fonction pour vérifier si l'utilisateur est connecté
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    return userToken !== null;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
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

// Fonction pour se connecter
export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    console.log("Tentative de connexion avec:", { email });

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
      Alert.alert(
        "Erreur de connexion",
        errorData.message || "Identifiants incorrects ou serveur indisponible"
      );
      return false;
    }

    const data = await response.json();
    console.log("Données de connexion:", data);

    // Stocker le token si présent dans la réponse
    if (data && data.token) {
      // Stocker le token dans AsyncStorage
      await AsyncStorage.setItem("userToken", data.token);

      // Stocker les infos utilisateur si nécessaire
      if (data.user) {
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
      }
      return true;
    } else {
      Alert.alert("Erreur", "Données de connexion invalides reçues du serveur");
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
  password: string
): Promise<boolean> => {
  try {
    console.log("Tentative d'inscription avec:", { username: name, email });

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: name, email, password }),
    });

    console.log("Réponse du serveur:", response);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Erreur inconnue" }));
      console.error("Erreur d'inscription:", errorData);
      Alert.alert(
        "Erreur d'inscription",
        errorData.message || "Une erreur est survenue lors de l'inscription"
      );
      return false;
    }

    const data = await response.json();
    console.log("Données d'inscription:", data);
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
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
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
  roomId: string,
  roomName: string
): Promise<void> => {
  const canAccess = await requireAuth(navigation, `au salon "${roomName}"`);

  if (canAccess) {
    try {
      // Vérifier l'accès au salon auprès de l'API (facultatif)
      // const response = await axios.get(`${API_BASE_URL}/chatrooms/${roomId}/access`, {
      //   headers: { Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}` }
      // });

      // Naviguer vers le salon de chat
      navigation.navigate("ChatRoom", { roomId, roomName });
    } catch (error) {
      console.error("Erreur d'accès au salon:", error);
      Alert.alert("Erreur", "Impossible d'accéder à ce salon pour le moment.");
    }
  }
};
