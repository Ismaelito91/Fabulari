import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import io from "socket.io-client";
import { FONTS } from "../constants/fonts";
import {
  setupAuthorizationHeader,
  getWorkingApiEndpoint,
} from "../utils/authUtils";
import DefaultText from "../components/DefaultText";

// URL de base de l'API (à configurer selon votre environnement)
const API_BASE_URL = "http://localhost:3001/api";
const SOCKET_URL = "http://localhost:3001";

// Type pour les messages
type Message = {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  timestamp: string;
  isCurrentUser: boolean;
  sendFailed?: boolean;
};

// Props de l'écran
type ChatRoomScreenProps = {
  route: RouteProp<RootStackParamList, "ChatRoom">;
  navigation: StackNavigationProp<RootStackParamList, "ChatRoom">;
};

// Définition du composant sans utiliser React.FC
export default function ChatRoomScreen({
  route,
  navigation,
}: ChatRoomScreenProps) {
  const { roomId: roomIdParam, roomName } = route.params;
  // Convertir l'ID en nombre si c'est une chaîne
  const roomId =
    typeof roomIdParam === "string" ? parseInt(roomIdParam, 10) : roomIdParam;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(
    new Set()
  );

  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  // Charger les messages du salon
  const loadMessages = async (userData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Configuration des en-têtes d'autorisation
      await setupAuthorizationHeader();

      // Récupérer à nouveau le token pour être sûr
      const token = await AsyncStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(`Tentative d'accès aux messages pour le salon: ${roomId}`);
      const response = await getWorkingApiEndpoint(
        `/chat/rooms/${roomId}/messages`,
        "GET",
        token,
        undefined,
        navigation
      );

      console.log("Réponse API messages (status):", response.status);

      if (!response.ok) {
        // Tenter de lire le corps de la réponse d'erreur
        const errorBody = await response.text();
        console.error("Erreur API messages:", response.status, errorBody);
        throw new Error(`Erreur HTTP: ${response.status}. ${errorBody}`);
      }

      const data = await response.json();
      console.log("Données reçues:", data ? "Disponibles" : "Vides");

      // Vérification des données
      if (!data || !data.messages || !Array.isArray(data.messages)) {
        console.error("Format de données invalide:", data);
        throw new Error("Format de données invalide");
      }

      // Traitement des messages reçus
      const messagesWithUser = data.messages.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        userId: msg.userId.toString(),
        userName: msg.User ? msg.User.username : "Inconnu",
        timestamp: msg.createdAt,
        isCurrentUser: msg.userId.toString() === userData?.id,
      }));

      setMessages(messagesWithUser);

      // Enregistrer les IDs des messages déjà traités
      const ids = new Set<string>();
      messagesWithUser.forEach((msg: Message) => {
        ids.add(msg.id);
      });
      setProcessedMessageIds(ids);

      setIsLoading(false);
    } catch (error: any) {
      console.error("Erreur globale:", error);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Configurer la navigation
    navigation.setOptions({
      title: roomName,
      headerTintColor: "#FFFFFF",
      headerStyle: {
        backgroundColor: "#2D5A5A",
      },
    });

    // Récupérer les informations de l'utilisateur
    const getUserInfo = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setCurrentUser({
            id: userData.id || "temp-user-id",
            name: userData.name || "Utilisateur",
          });
          return userData;
        }
        return null;
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des infos utilisateur:",
          err
        );
        return null;
      }
    };

    // Initialiser Socket.IO
    const setupSocket = (userData: any) => {
      try {
        // Connexion au serveur Socket.IO
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        // Événements Socket.IO
        socket.on("connect", () => {
          console.log("Connecté au serveur Socket.IO");
          socket.emit("join_room", roomId);
        });

        socket.on("receive_message", (messageData: any) => {
          // Vérifier si nous avons déjà traité ce message
          if (processedMessageIds.has(messageData.id.toString())) {
            return;
          }

          // Vérifier si ce message est de l'utilisateur actuel
          const isFromCurrentUser =
            messageData.userId.toString() === userData?.id;

          // Si c'est un message de l'utilisateur actuel, vérifier s'il est déjà affiché
          if (isFromCurrentUser) {
            const messageExists = messages.some(
              (msg) => msg.content === messageData.content && msg.isCurrentUser
            );
            if (messageExists) {
              return;
            }
          }

          const newMessage = {
            id: messageData.id.toString(),
            content: messageData.content,
            userId: messageData.userId.toString(),
            userName: messageData.userName || "Inconnu",
            timestamp: messageData.timestamp || new Date().toISOString(),
            isCurrentUser: isFromCurrentUser,
          };

          // Ajouter l'ID à la liste des messages traités
          setProcessedMessageIds((prev) =>
            new Set(prev).add(messageData.id.toString())
          );

          setMessages((prevMessages) => [...prevMessages, newMessage]);

          // Scroll to bottom on new message
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        socket.on("disconnect", () => {
          console.log("Déconnecté du serveur Socket.IO");
        });

        socket.on("error", (error: any) => {
          console.error("Erreur Socket.IO:", error);
        });

        return socket;
      } catch (err) {
        console.error("Erreur lors de l'initialisation de Socket.IO:", err);
        return null;
      }
    };

    // Initialisation
    const initialize = async () => {
      const userData = await getUserInfo();
      await loadMessages(userData);
      setupSocket(userData);
    };

    initialize();

    // Nettoyer les ressources à la fermeture
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, roomName, navigation, processedMessageIds]);

  // Fonction pour envoyer un nouveau message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const tempId = `temp-${Date.now()}`;

    // Créer un message temporaire
    const tempMessage: Message = {
      id: tempId,
      content: newMessage,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    };

    // Ajouter le message à la liste locale immédiatement
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage("");

    // Faire défiler vers le nouveau message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Récupérer le token d'authentification
      const userToken = await AsyncStorage.getItem("userToken");

      if (!userToken) {
        // Gérer l'échec de l'envoi
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempId ? { ...msg, sendFailed: true } : msg
          )
        );

        // Proposer à l'utilisateur de se connecter ou s'inscrire
        Alert.alert(
          "Connexion requise",
          "Vous devez être connecté pour envoyer des messages",
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
        return;
      }

      try {
        // Envoyer le message en utilisant notre fonction améliorée
        const response = await getWorkingApiEndpoint(
          `/chat/rooms/${roomId}/messages`,
          "POST",
          userToken,
          JSON.stringify({ content: newMessage }),
          navigation
        );

        // Vérifier si nous avons une erreur 401
        if (response.status === 401) {
          // La fonction getWorkingApiEndpoint a déjà géré la redirection
          // Marquer le message comme échoué
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === tempId ? { ...msg, sendFailed: true } : msg
            )
          );
          return;
        }

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Récupérer la réponse
        const serverMessage = await response.json();

        // Mettre à jour le message avec les informations du serveur
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempId
              ? {
                  ...serverMessage,
                  isCurrentUser: true,
                  content: serverMessage.content || msg.content,
                  userName: serverMessage.userName || currentUser.name,
                }
              : msg
          )
        );

        // Émettre le message via Socket.IO
        if (socketRef.current) {
          socketRef.current.emit("send_message", {
            roomId,
            ...serverMessage,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (apiError: any) {
        console.error("Erreur API lors de l'envoi du message:", apiError);

        // Vérifier s'il s'agit d'une erreur d'authentification
        if (
          apiError.response &&
          (apiError.response.status === 401 ||
            apiError.response.status === 403 ||
            (apiError.response.data.message &&
              apiError.response.data.message.includes("trouvé")))
        ) {
          setError("Authentification requise. Veuillez vous reconnecter.");

          // Marquer le message comme échoué
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === tempId ? { ...msg, sendFailed: true } : msg
            )
          );

          // Tentative de redirection vers la connexion après un court délai
          setTimeout(() => {
            navigation.navigate("Login");
          }, 2000);

          return;
        }

        // Si l'API échoue mais que socket.io est disponible, on peut quand même tenter d'envoyer
        if (socketRef.current) {
          socketRef.current.emit("send_message", {
            roomId,
            id: tempId,
            content: newMessage,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Marquer le message comme échoué
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === tempId ? { ...msg, sendFailed: true } : msg
            )
          );
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);

      // Gérer l'échec de l'envoi
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempId ? { ...msg, sendFailed: true } : msg
        )
      );
    }
  };

  // Formater la date pour l'affichage
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Rendu d'un élément de message
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isCurrentUser
          ? styles.userMessageContainer
          : styles.otherMessageContainer,
      ]}
    >
      {!item.isCurrentUser && (
        <DefaultText style={styles.messageSender}>{item.userName}</DefaultText>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isCurrentUser
            ? styles.userMessageBubble
            : styles.otherMessageBubble,
          item.sendFailed && styles.failedMessageBubble,
        ]}
      >
        <DefaultText
          style={[
            styles.messageText,
            item.isCurrentUser && styles.userMessageText,
            item.sendFailed && styles.failedMessageText,
          ]}
        >
          {item.content}
        </DefaultText>
      </View>
      <View style={styles.messageFooter}>
        <DefaultText style={styles.messageTime}>
          {formatTime(item.timestamp)}
        </DefaultText>
        {item.sendFailed && (
          <TouchableOpacity
            onPress={() => {
              // Tenter de renvoyer le message
              const messageContent = item.content;
              // Supprimer le message échoué
              setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.id !== item.id)
              );
              // Réinitialiser le champ de texte avec le contenu du message échoué
              setNewMessage(messageContent);
            }}
          >
            <DefaultText style={styles.retryText}>Réessayer</DefaultText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D5A5A" />
        <DefaultText style={styles.loaderText}>
          Chargement des messages...
        </DefaultText>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <DefaultText style={styles.errorText}>{error}</DefaultText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            // Recharger les messages
            const reloadMessages = async () => {
              const userData = await AsyncStorage.getItem("userData");
              if (userData) {
                await loadMessages(JSON.parse(userData));
              }
            };
            reloadMessages();
          }}
        >
          <DefaultText style={styles.retryButtonText}>Réessayer</DefaultText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Écrivez votre message..."
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Icon name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#2D5A5A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  messageList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  messageSender: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
    marginLeft: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 60,
  },
  userMessageBubble: {
    backgroundColor: "#2D5A5A",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  failedMessageBubble: {
    backgroundColor: "rgba(255, 107, 107, 0.8)",
  },
  messageText: {
    fontSize: 16,
    color: "#333333",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  failedMessageText: {
    color: "#FFFFFF",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    marginRight: 2,
  },
  messageTime: {
    fontSize: 10,
    color: "#999999",
  },
  retryText: {
    fontSize: 10,
    color: "#FF6B6B",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#2D5A5A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
});
