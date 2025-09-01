import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { isAuthenticated } from "../utils/authUtils";

type ChatRoom = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
};

const ChatRoomList: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isAuthenticated();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();

    // Simuler le chargement des salons de chat
    setChatRooms([
      {
        id: "1",
        name: "Club de Lecture Fantasy",
        lastMessage:
          "Qu'avez-vous pensé du nouveau livre de Brandon Sanderson?",
        timestamp: "10:45",
      },
      {
        id: "2",
        name: "Romans Classiques",
        lastMessage: "Notre prochaine lecture sera 'Les Misérables'",
        timestamp: "Hier",
      },
      {
        id: "3",
        name: "Science-Fiction",
        lastMessage: "Discussion sur Dune et son adaptation cinématographique",
        timestamp: "Lun",
      },
    ]);
  }, []);

  const handleChatRoomPress = (roomId: string, roomName: string) => {
    if (isLoggedIn) {
      navigation.navigate("ChatRoom", { roomId, roomName });
    } else {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour accéder aux salons de discussion.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoom}
      onPress={() => handleChatRoomPress(item.id, item.name)}
    >
      <View style={styles.chatRoomContent}>
        <Text style={styles.chatRoomName}>{item.name}</Text>
        <Text style={styles.chatRoomLastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.chatRoomTimestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salons de discussion</Text>
      </View>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D5A5A",
  },
  list: {
    paddingHorizontal: 20,
  },
  chatRoom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  chatRoomContent: {
    flex: 1,
    marginRight: 10,
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  chatRoomLastMessage: {
    fontSize: 14,
    color: "#777777",
  },
  chatRoomTimestamp: {
    fontSize: 12,
    color: "#AAAAAA",
  },
});

export default ChatRoomList;
