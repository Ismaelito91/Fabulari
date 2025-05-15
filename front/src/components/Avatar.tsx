import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AvatarProps {
  size?: number;
  showBorder?: boolean;
  avatarType?: string;
}

const DynamicAvatar: React.FC<AvatarProps> = ({
  size = 150,
  showBorder = false,
  avatarType: propAvatarType,
}) => {
  const [avatarType, setAvatarType] = useState<string>(propAvatarType || "boy");
  const [isLoading, setIsLoading] = useState<boolean>(
    propAvatarType ? false : true
  );

  // Charger les données de l'avatar depuis le stockage seulement si aucun type n'est spécifié en prop
  useEffect(() => {
    if (propAvatarType) {
      setAvatarType(propAvatarType);
      setIsLoading(false);
    } else {
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
          console.error(
            "Erreur lors du chargement des données d'avatar:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      loadUserAvatar();
    }
  }, [propAvatarType]);

  // Détecter les changements de propAvatarType pour mettre à jour l'avatar
  useEffect(() => {
    if (propAvatarType) {
      setAvatarType(propAvatarType);
    }
  }, [propAvatarType]);

  // Si les données sont en cours de chargement, afficher un indicateur
  if (isLoading) {
    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
    <Image
      source={getAvatarImage()}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
        ...(showBorder ? styles.withBorder : {}),
      }}
    />
  );
};

const styles = StyleSheet.create({
  withBorder: {
    borderWidth: 3,
    borderColor: "#2D5A5A",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
});

export default DynamicAvatar;
