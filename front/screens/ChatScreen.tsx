import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { getRoomMessages } from "../services/chatService";
import {
  initializeSocket,
  joinRoom,
  sendSocketMessage,
  subscribeToMessages,
} from "../services/socketService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Message } from "../types";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Rooms: undefined;
  Chat: { roomId: number; roomName: string };
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, "Chat">;
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

type Props = {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
};

const ChatScreen: React.FC<Props> = ({ route }) => {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState<any>(null);

  // Charger les messages existants et configurer Socket.IO
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Dans un cas réel, vous récupéreriez le token depuis le stockage
        const token = "votre_token_jwt";
        const result = await getRoomMessages(token, roomId);
        setMessages(result.messages || []);
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    };

    // Initialiser Socket.IO
    const socket = initializeSocket();
    setSocket(socket);

    // Rejoindre la room
    joinRoom(roomId);

    // Écouter les nouveaux messages
    subscribeToMessages((newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    loadMessages();

    // Nettoyage
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  // Envoyer un message
  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    const messageData = {
      roomId,
      content: messageText,
      user: {
        // Dans un cas réel, vous récupéreriez les données utilisateur depuis un contexte/state
        username: "Utilisateur",
      },
    };

    sendSocketMessage(messageData);
    setMessageText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomName}>{roomName}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.username}>{item.user?.username}</Text>
            <Text style={styles.messageContent}>{item.content}</Text>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Écrivez votre message..."
        />
        <Button title="Envoyer" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 5,
  },
  username: {
    fontWeight: "bold",
  },
  messageContent: {
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
});

export default ChatScreen;
