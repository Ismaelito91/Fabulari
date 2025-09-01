import React from "react";
import { TouchableOpacity, StyleSheet, View, Image, Text } from "react-native";
import DefaultText from "./DefaultText";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FONTS } from "../constants/fonts";

// Images pour les icônes
const loginIconImage = require("../assets/Fichier 3.png");

type LoginButtonNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Home"
>;

export default function LoginButton() {
  const navigation = useNavigation<LoginButtonNavigationProp>();

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.buttonsContainer}>
      {/* Bouton de connexion */}
      <TouchableOpacity style={styles.navButton} onPress={handleLogin}>
        <View style={styles.iconContainer}>
          <Image
            source={loginIconImage}
            style={styles.buttonIcon}
            resizeMode="contain"
          />
        </View>
        <DefaultText style={styles.navButtonText}>Connexion</DefaultText>
      </TouchableOpacity>

      {/* Bouton d'inscription */}
      <TouchableOpacity style={styles.navButton} onPress={handleRegister}>
        <View style={[styles.iconContainer, styles.registerIconContainer]}>
          <Text style={styles.registerIcon}>+</Text>
        </View>
        <DefaultText style={styles.navButtonText}>Inscription</DefaultText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  navButtonText: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 2,
    fontWeight: "bold",
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(45, 90, 90, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  registerIconContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.8)", // Vert pour différencier
  },
  registerIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  buttonIcon: {
    width: 25,
    height: 25,
  },
});
