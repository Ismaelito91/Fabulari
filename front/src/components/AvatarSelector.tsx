import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";

// Types d'avatar disponibles
export type AvatarType = "boy" | "girl";

interface AvatarSelectorProps {
  selectedAvatar: AvatarType;
  onSelectAvatar: (type: AvatarType) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelectAvatar,
}) => {
  // Images des avatars
  const boyAvatar = require("../assets/Chibi_garcon1.png");
  const girlAvatar = require("../assets/Fille-1.png");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez votre avatar :</Text>

      <View style={styles.avatarsContainer}>
        <TouchableOpacity
          style={[
            styles.avatarOption,
            selectedAvatar === "boy" && styles.selectedAvatar,
          ]}
          onPress={() => onSelectAvatar("boy")}
        >
          <Image source={boyAvatar} style={styles.avatarImage} />
          <Text style={styles.avatarLabel}>Garçon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.avatarOption,
            selectedAvatar === "girl" && styles.selectedAvatar,
          ]}
          onPress={() => onSelectAvatar("girl")}
        >
          <Image source={girlAvatar} style={styles.avatarImage} />
          <Text style={styles.avatarLabel}>Fille</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  avatarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  avatarOption: {
    alignItems: "center",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedAvatar: {
    borderColor: "#2D5A5A",
    backgroundColor: "rgba(45, 90, 90, 0.1)",
  },
  avatarImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  avatarLabel: {
    marginTop: 5,
    fontSize: 16,
  },
});

export default AvatarSelector;
