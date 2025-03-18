import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import { getPublicRooms, createRoom } from "../services/roomService";
import { Room } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Rooms: undefined;
  Chat: { roomId: number; roomName: string };
};

type RoomsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Rooms"
>;

type Props = {
  navigation: RoomsScreenNavigationProp;
};

const RoomsScreen: React.FC<Props> = ({ navigation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les rooms au démarrage
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      // Dans un cas réel, récupérez le token depuis le stockage
      const token = "votre_token_jwt";
      const data = await getPublicRooms(token);
      setRooms(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les rooms");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = () => {
    // Navigation vers un écran de création de room ou affichage d'un modal
    Alert.alert(
      "Créer une room",
      "Cette fonctionnalité sera disponible bientôt !"
    );
  };

  const handleRoomPress = (room: Room) => {
    navigation.navigate("Chat", {
      roomId: room.id,
      roomName: room.name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salles de discussion</Text>
        <Button title="+ Créer" onPress={handleCreateRoom} />
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => handleRoomPress(item)}
            >
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomDescription}>{item.description}</Text>
              <Text style={styles.roomCreator}>
                Créée par: {item.creator?.username || "Utilisateur inconnu"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Aucune salle disponible. Créez-en une !
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  roomItem: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roomDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
  roomCreator: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#666",
  },
});

export default RoomsScreen;
