import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ImageBackground,
  TextInput,
  Modal,
  SafeAreaView,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import Icon from "react-native-vector-icons/Ionicons";

type ChatRoomScreenProps = {
  route: RouteProp<RootStackParamList, "ChatRoom">;
  navigation: StackNavigationProp<RootStackParamList, "ChatRoom">;
};

// Position prédéfinie pour l'avatar de l'utilisateur connecté
// Repositionné pour apparaître en bas du salon, au-dessus du sol
const connectedUserAvatar = {
  x: Dimensions.get("window").width / 2 - 40, // centré horizontalement
  y: Dimensions.get("window").height - 200, // plus bas, près du sol
  name: "Vous",
  type: "boy",
};

export default function ChatRoomScreen({
  route,
  navigation,
}: ChatRoomScreenProps) {
  // États simplifiés pour éviter les erreurs potentielles
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [activeBubble, setActiveBubble] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  // Taille fixe pour l'avatar unique
  const avatarSize = 120; // Grande taille puisqu'il n'y a qu'un seul avatar

  // Configuration du titre de la navigation
  useEffect(() => {
    navigation.setOptions({
      title: "Salon de lecture",
      headerTintColor: "#FFFFFF",
      headerStyle: {
        backgroundColor: "#2D5A5A",
      },
    });
  }, [navigation]);

  // Envoyer un message
  const sendMessage = () => {
    if (!message.trim()) return;

    // Afficher la bulle
    setActiveBubble({
      visible: true,
      content: message,
      x: connectedUserAvatar.x - 50,
      y: connectedUserAvatar.y - 80,
    });

    // Masquer la bulle après 3 secondes
    setTimeout(() => {
      setActiveBubble((prev) => ({ ...prev, visible: false }));
    }, 3000);

    // Réinitialiser
    setMessageModalVisible(false);
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundFallback}>
        <ImageBackground
          source={require("../assets/dessins-fond-vegetal.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Éléments de la salle recréés en CSS */}
          <View style={styles.salleContainer}>
            {/* Fond coloré simulant le salon */}
            <View style={styles.floor}></View>
            <View style={styles.wall}></View>

            {/* Éléments de mobilier simplifiés */}
            <View style={styles.sofa}></View>
            <View style={styles.table}></View>
            <View style={styles.plant}></View>
          </View>

          {/* Affichage de l'avatar de l'utilisateur connecté */}
          <View
            style={{
              position: "absolute",
              left: connectedUserAvatar.x,
              top: connectedUserAvatar.y,
              alignItems: "center",
              zIndex: 10,
              width: 100, // largeur fixe pour l'ensemble
              height: 140, // assez de hauteur pour l'avatar et le texte en dessous
            }}
          >
            <Image
              source={require("../assets/Chibi_garcon1.png")}
              style={{
                width: 80,
                height: 120, // plus haut que large pour garder les proportions correctes
                resizeMode: "contain", // préserve les proportions sans couper l'image
              }}
            />
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 15,
                marginTop: -5, // chevauchement léger avec l'avatar
              }}
            >
              <Text
                style={{
                  color: "#333",
                  fontSize: 12,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {connectedUserAvatar.name}
              </Text>
            </View>
          </View>

          {/* Bulle de message si nécessaire */}
          {activeBubble.visible && (
            <View
              style={[
                styles.messageBubble,
                {
                  left: activeBubble.x,
                  top: activeBubble.y,
                },
              ]}
            >
              <Text style={styles.bubbleText}>{activeBubble.content}</Text>
            </View>
          )}

          {/* Bouton d'aide */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert("Aide", "Bienvenue dans votre salon de lecture")
            }
          >
            <Icon name="help-circle" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </ImageBackground>
      </View>

      {/* Modal pour écrire un message */}
      <Modal
        visible={messageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Envoyer un message à {connectedUserAvatar.name}
            </Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Écrivez votre message..."
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setMessageModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.sendButton]}
                onPress={sendMessage}
              >
                <Text style={styles.buttonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backgroundFallback: {
    flex: 1,
    backgroundColor: "#E8D3C3", // Couleur de secours
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  // Éléments de la salle recréés en CSS
  salleContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floor: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "40%",
    backgroundColor: "#A3EAD1", // Vert clair pour le sol
  },
  wall: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "60%",
    backgroundColor: "#E8D3C3", // Beige pour les murs
  },
  sofa: {
    position: "absolute",
    bottom: "15%",
    left: "15%",
    width: "40%",
    height: "12%",
    backgroundColor: "#7682AC", // Bleu pour le canapé
    borderRadius: 10,
  },
  table: {
    position: "absolute",
    bottom: "10%",
    left: "30%",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F0", // Blanc cassé pour la table
  },
  plant: {
    position: "absolute",
    bottom: "15%",
    right: "15%",
    width: 60,
    height: 100,
    backgroundColor: "#2E8720", // Vert pour la plante
    borderRadius: 30,
  },
  messageBubble: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 15,
    maxWidth: 150,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 20,
  },
  bubbleText: {
    fontSize: 14,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#2D5A5A",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  sendButton: {
    backgroundColor: "#2D5A5A",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  helpButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2D5A5A",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 30,
  },
});
