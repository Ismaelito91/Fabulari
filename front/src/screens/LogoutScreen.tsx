import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { logout } from "../utils/authUtils";

type LogoutScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Logout">;
};

const LogoutScreen = ({ navigation }: LogoutScreenProps) => {
  const [logoutStatus, setLogoutStatus] = useState<string>(
    "Déconnexion en cours..."
  );

  useEffect(() => {
    // Fonction pour déconnecter l'utilisateur
    const performLogout = async () => {
      try {
        setLogoutStatus("Suppression des données de session...");

        // Utiliser la fonction de déconnexion simplifiée
        const success = await logout();

        if (success) {
          setLogoutStatus("Déconnexion réussie. Redirection...");
        } else {
          setLogoutStatus(
            "Échec de la déconnexion. Tentative de récupération..."
          );
        }

        // Dans tous les cas, rediriger vers l'accueil après un court délai
        setTimeout(() => {
          // Réinitialiser la pile de navigation pour éviter tout retour à l'écran profil
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }, 1500);
      } catch (error) {
        console.error("Erreur critique lors de la déconnexion:", error);
        setLogoutStatus("Erreur inattendue. Redirection vers l'accueil...");

        // En cas d'erreur, rediriger quand même vers l'accueil
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }, 1500);
      }
    };

    // Exécuter la déconnexion
    performLogout();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D5A5A" />
      <Text style={styles.text}>{logoutStatus}</Text>
      <Text style={styles.subText}>Veuillez patienter...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: "#2D5A5A",
    textAlign: "center",
  },
  subText: {
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
});

export default LogoutScreen;
