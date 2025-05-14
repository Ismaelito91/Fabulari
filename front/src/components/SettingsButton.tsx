import React, { useState } from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { isAuthenticated } from "../utils/authUtils";

type SettingsButtonProps = {
  size?: number;
};

const SettingsButton: React.FC<SettingsButtonProps> = ({ size = 40 }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Vérifier si l'utilisateur est connecté
  React.useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isAuthenticated();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();
  }, []);

  const handlePress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleNavigation = (
    screen:
      | "Login"
      | "Register"
      | "ProfileScreen"
      | "Home"
      | "BookList"
      | "SwipeList"
      | "Vestiaire"
      | "Splash"
      | "FavoriteBooks"
  ) => {
    closeModal();
    navigation.navigate(screen);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Image
          source={require("../assets/Fichier 3.png")}
          style={[styles.icon, { width: size, height: size }]}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {isLoggedIn ? "Paramètres du compte" : "Accès au compte"}
                </Text>

                {isLoggedIn ? (
                  // Options pour utilisateur connecté
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleNavigation("ProfileScreen")}
                    >
                      <Text style={styles.menuText}>Mon profil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        // Déconnexion (à implémenter)
                        closeModal();
                      }}
                    >
                      <Text style={styles.menuText}>Déconnexion</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Options pour utilisateur non connecté
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleNavigation("Login")}
                    >
                      <Text style={styles.menuText}>Se connecter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleNavigation("Register")}
                    >
                      <Text style={styles.menuText}>S'inscrire</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Autre options communes aux deux états */}
                <TouchableOpacity style={styles.menuItem} onPress={closeModal}>
                  <Text style={styles.menuText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  icon: {
    resizeMode: "contain",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2D5A5A",
    textAlign: "center",
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SettingsButton;
