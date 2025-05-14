import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons"; // Assurez-vous d'installer cette dépendance

// URL de base de l'API (à configurer selon votre environnement)
const API_BASE_URL = "http://localhost:3000/api"; // ou l'URL de votre API

// Type pour les messages
type Message = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  isCurrentUser: boolean;
};

// Props de l'écran
type ChatRoomScreenProps = {
  route: RouteProp<RootStackParamList, "ChatRoom">;
  navigation: StackNavigationProp<RootStackParamList, "ChatRoom">;
};

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  route,
  navigation,
}) => {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const flatListRef = useRef<FlatList>(null);

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
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des infos utilisateur:",
          err
        );
      }
    };

    // Charger les messages du salon
    const loadMessages = async () => {
      try {
        setIsLoading(true);

        // Récupérer le token d'authentification
        const userToken = await AsyncStorage.getItem("userToken");

        // Configuration des en-têtes pour les requêtes API
        const headers = userToken
          ? { Authorization: `Bearer ${userToken}` }
          : {};

        // Appel à l'API pour récupérer les messages
        // Décommentez cette section lorsque votre API est prête
        /*
        const response = await axios.get(
          `${API_BASE_URL}/chatrooms/${roomId}/messages`, 
          { headers }
        );
        
        // Traitement des messages reçus
        const messagesWithUser = response.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.userId === currentUser?.id
        }));
        
        setMessages(messagesWithUser);
        */

        // Données fictives pour le développement
        setMessages([
          {
            id: "1",
            text: "Bonjour et bienvenue dans ce salon de discussion !",
            userId: "admin",
            userName: "Administrateur",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isCurrentUser: false,
          },
          {
            id: "2",
            text: "Merci ! Je suis ravi de rejoindre cette communauté.",
            userId: "temp-user-id",
            userName: "Vous",
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            isCurrentUser: true,
          },
          {
            id: "3",
            text: "Quelqu'un a-t-il lu le dernier roman de Marc Levy ?",
            userId: "user2",
            userName: "Sophie",
            timestamp: new Date(Date.now() - 900000).toISOString(),
            isCurrentUser: false,
          },
          {
            id: "4",
            text: "Je suis en train de le lire, c'est passionnant !",
            userId: "user3",
            userName: "Thomas",
            timestamp: new Date(Date.now() - 600000).toISOString(),
            isCurrentUser: false,
          },
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des messages:", err);
        setError("Impossible de charger les messages pour le moment.");
        setIsLoading(false);
      }
    };

    getUserInfo().then(loadMessages);

    // Configurer une connexion WebSocket en temps réel (à implémenter plus tard)
    // const socket = io(`${API_BASE_URL}/chatrooms/${roomId}`);

    // Nettoyer les ressources à la fermeture
    return () => {
      // socket.disconnect();
    };
  }, [roomId, roomName, navigation]);

  // Fonction pour envoyer un nouveau message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const tempId = `temp-${Date.now()}`;

    // Créer un message temporaire
    const tempMessage: Message = {
      id: tempId,
      text: newMessage,
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

      // Configuration des en-têtes pour les requêtes API
      const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

      // Envoyer le message au serveur
      // Décommentez cette section lorsque votre API est prête
      /*
      const response = await axios.post(
        `${API_BASE_URL}/chatrooms/${roomId}/messages`,
        { text: newMessage },
        { headers }
      );
      
      // Mettre à jour le message avec les informations du serveur
      const serverMessage = response.data;
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempId ? { ...serverMessage, isCurrentUser: true } : msg
        )
      );
      */
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);

      // Gérer l'échec de l'envoi (optionnel: marquer le message comme échoué)
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
        <Text style={styles.messageSender}>{item.userName}</Text>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isCurrentUser
            ? styles.userMessageBubble
            : styles.otherMessageBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
      <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
    </View>
  );

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D5A5A" />
        <Text style={styles.loaderText}>Chargement des messages...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            // Recharger les messages...
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
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
};

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
  messageText: {
    fontSize: 16,
    color: "#333333",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 10,
    color: "#999999",
    alignSelf: "flex-end",
    marginTop: 2,
    marginRight: 2,
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

export default ChatRoomScreen;
