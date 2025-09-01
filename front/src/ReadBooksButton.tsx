import React from "react";
import { TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Définir directement RootStackParamList ici
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  BookList: undefined;
  SwipeList: undefined;
  FavoriteBooks: undefined;
  Vestiaire: undefined;
  ChatRoom: { roomId: string; roomName: string };
  Splash: undefined;
  Logout: undefined;
};

// Pour l'authentification, utiliser AsyncStorage directement
import AsyncStorage from "@react-native-async-storage/async-storage";

type ReadBooksButtonProps = {
  size?: number;
};

const ReadBooksButton: React.FC<ReadBooksButtonProps> = ({ size = 40 }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePress = async () => {
    // Vérifier l'état d'authentification au moment du clic
    const isAuthenticated = async (): Promise<boolean> => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");
        return userToken !== null && userData !== null;
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
        return false;
      }
    };

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
