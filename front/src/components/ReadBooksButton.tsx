import React, { useState, useEffect } from "react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isAuthenticated();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();
  }, []);

  const handlePress = () => {
    if (isLoggedIn) {
      // Naviguer vers l'écran des livres lus
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
