import React from "react";
import { TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { isAuthenticated } from "../utils/authUtils";

type ReadBooksButtonProps = {
  size?: number;
};

const ReadBooksButton: React.FC<ReadBooksButtonProps> = ({ size = 40 }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = async () => {
    // Vérifier l'état d'authentification au moment du clic
    const loggedIn = await isAuthenticated();

    if (loggedIn) {
      // Naviguer vers l'écran des livres lus si connecté
      navigation.navigate("FavoriteBooks");
    } else {
      // Afficher une alerte pour inciter à se connecter
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour accéder à vos livres lus.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: "S'inscrire",
            onPress: () => navigation.navigate("Register"),
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Image
        source={require("../assets/Fichier 27.png")}
        style={[styles.icon, { width: size, height: size }]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  icon: {
    resizeMode: "contain",
  },
});

export default ReadBooksButton;
