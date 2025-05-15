import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AvatarProps {
  size?: number;
  showBorder?: boolean;
}

const DynamicAvatar: React.FC<AvatarProps> = ({
  size = 100,
  showBorder = true,
}) => {
  const [avatarType, setAvatarType] = useState<string>("boy");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger les données de l'avatar depuis le stockage
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        setIsLoading(true);
        const userDataString = await AsyncStorage.getItem("userData");

        if (userDataString) {
          const userData = JSON.parse(userDataString);

          // Vérifier si l'utilisateur a un avatar défini
          if (userData.avatar && userData.avatar.type) {
            setAvatarType(userData.avatar.type);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données d'avatar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAvatar();
  }, []);

  // Si les données sont en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <View style={[styles.avatarContainer, { width: size, height: size }]}>
        <ActivityIndicator color="#2D5A5A" />
      </View>
    );
  }

  // Sélectionner l'image d'avatar en fonction du type
  const getAvatarImage = () => {
    return avatarType === "girl"
      ? require("../assets/Fille-1.png")
      : require("../assets/Chibi garçon.png");
  };

  return (
    <View
      style={[
        styles.avatarContainer,
        { width: size, height: size },
        showBorder && styles.withBorder,
      ]}
    >
      <Image
        source={getAvatarImage()}
        style={[styles.avatar, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 50,
  },
  withBorder: {
    borderWidth: 3,
    borderColor: "#2D5A5A",
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});

export default DynamicAvatar;
