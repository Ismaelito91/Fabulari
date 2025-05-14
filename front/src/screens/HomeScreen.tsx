import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import ChatRoomList from "../components/ChatRoomList";
import { isAuthenticated } from "../utils/authUtils";
import SettingsButton from "../components/SettingsButton";
import ReadBooksButton from "../components/ReadBooksButton";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  // Fonction pour vérifier si l'utilisateur est connecté
  const userIsLoggedIn = isAuthenticated();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Fabulari 📚</Text>
        <View style={styles.headerButtons}>
          <ReadBooksButton size={35} />
          <SettingsButton size={35} />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Explorer notre bibliothèque</Text>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => navigation.navigate("BookList")}
            >
              <Text style={styles.featureButtonText}>Voir les livres</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureTitle}>
              Découvrir des recommandations
            </Text>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => navigation.navigate("SwipeList")}
            >
              <Text style={styles.featureButtonText}>Découvrir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Gérer votre profil</Text>
            <TouchableOpacity
              style={styles.featureButton}
              onPress={() => navigation.navigate("ProfileScreen")}
            >
              <Text style={styles.featureButtonText}>Mon profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des salons de chat */}
        <View style={styles.chatContainer}>
          <ChatRoomList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D5A5A",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  featuresContainer: {
    padding: 20,
  },
  feature: {
    backgroundColor: "#F7F7F7",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  featureButton: {
    backgroundColor: "#2D5A5A",
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  featureButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  chatContainer: {
    flex: 1,
  },
});
