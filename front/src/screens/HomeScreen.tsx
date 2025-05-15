import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ImageBackground,
  Image,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import DefaultText from "../components/DefaultText";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import {
  isAuthenticated,
  setupAuthorizationHeader,
  getWorkingApiEndpoint,
} from "../utils/authUtils";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginButton from "../components/LoginButton";
import { FONTS } from "../constants/fonts";

// Images
const backgroundImage = require("../assets/dessins-fond-vegetal.png");
const doorImage = require("../assets/porte fantasy-texture 2.png");
const logoImage = require("../assets/Logo Fabulari -bleu3.png");
const bookIconImage = require("../assets/Fichier 27.png");

// URL de base de l'API
const API_BASE_URL = "http://localhost:3001/api"; // Ajustez selon votre configuration

// Dimensions de l'écran
const { width: windowWidth } = Dimensions.get("window");

// Types
interface ChatRoom {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// Style de titre en fonction du type de salon
const getTitleStyle = (roomType: string) => {
  switch (roomType.toLowerCase()) {
    case "fantasy":
      return {
        fontFamily: FONTS.MILLER_BANNER.ROMAN,
        fontWeight: "bold" as "bold",
        color: "#9c6d20",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontSize: 28,
      };
    case "romance":
      return {
        fontFamily: FONTS.MILLER_BANNER.ROMAN,
        fontStyle: "italic" as "italic",
        color: "#b84d69",
        textShadowColor: "rgba(255, 255, 255, 0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontSize: 28,
      };
    case "sci-fi":
    case "sf":
      return {
        fontFamily: FONTS.MILLER_BANNER.ROMAN,
        fontWeight: "bold" as "bold",
        color: "#3f88c5",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontSize: 28,
        letterSpacing: 2,
      };
    default:
      return {
        fontFamily: FONTS.MILLER_BANNER.ROMAN,
        fontWeight: "bold" as "bold",
        color: "#2D5A5A",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontSize: 28,
      };
  }
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  // États
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Chargement des salons de chat
  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier d'abord l'authenticité
      const isAuth = await isAuthenticated();
      console.log(
        "État d'authentification avant chargement des salons:",
        isAuth
      );

      // Configuration de l'en-tête d'autorisation
      await setupAuthorizationHeader();

      // Récupérer le token d'authentification pour vérification
      const userToken = await AsyncStorage.getItem("userToken");
      console.log("Token disponible pour requête:", userToken ? "Oui" : "Non");

      try {
        // Tenter d'abord avec l'URL publique (ne nécessite pas d'authentification)
        console.log("Tentative d'accès aux salons publics...");

        // Utiliser notre nouvelle fonction de diagnostic en passant la navigation
        const response = await getWorkingApiEndpoint(
          "/rooms/public",
          "GET",
          userToken,
          undefined,
          navigation
        );

        console.log("Réponse de l'API salons:", response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données reçues:", JSON.stringify(data).substring(0, 200));

        if (data && Array.isArray(data)) {
          setChatRooms(data);
          setIsLoading(false);
          return;
        } else {
          console.warn("Format de réponse inattendu:", data);
          throw new Error("Format de données inattendu");
        }
      } catch (apiError: any) {
        console.error("Erreur API salons publics:", apiError.message);
        console.error(
          "Détails de l'erreur:",
          apiError.response
            ? `Status: ${apiError.response.status}, Data: ${JSON.stringify(
                apiError.response.data
              )}`
            : "Pas de réponse du serveur"
        );

        // Si erreur 401, proposer à l'utilisateur de se connecter ou s'inscrire
        if (
          apiError.response?.status === 401 ||
          apiError.message?.includes("401")
        ) {
          console.log(
            "Authentification requise - Affichage des options de connexion"
          );

          // Afficher une alerte pour proposer connexion/inscription
          Alert.alert(
            "Authentification requise",
            "Vous devez être connecté pour accéder à tous les salons de chat.",
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

          // Utiliser les salons de secours
          throw new Error("Utilisation des salons de secours");
        }

        // Afficher une alerte avec plus de détails sur l'erreur
        Alert.alert(
          "Erreur de connexion",
          "Impossible de charger les salons depuis le serveur. Des salons de base seront affichés.",
          [{ text: "OK" }]
        );

        throw apiError;
      }

      // Si on arrive ici c'est qu'il y a eu un problème
      throw new Error("Réponse de l'API invalide");
    } catch (error: any) {
      console.error("Erreur lors du chargement des salons:", error.message);

      // Message d'erreur plus explicite
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Impossible de charger les salons";
      setError(`${errorMessage}. Veuillez réessayer.`);
      setIsLoading(false);

      // Salons de secours en cas d'erreur
      setChatRooms([
        {
          id: "1",
          name: "Fantasy",
          type: "fantasy",
          description: "Discussions sur la littérature fantastique",
        },
        {
          id: "2",
          name: "Romance",
          type: "romance",
          description: "Pour les amateurs de romance",
        },
        {
          id: "3",
          name: "Sci-Fi",
          type: "sf",
          description: "Science-fiction et anticipation",
        },
      ]);
    }
  };

  // Vérifier l'état d'authentification à chaque fois que l'écran reçoit le focus
  useFocusEffect(
    React.useCallback(() => {
      const checkAuthStatus = async () => {
        const loggedIn = await isAuthenticated();
        setUserIsLoggedIn(loggedIn);
        console.log("État de connexion vérifié:", loggedIn);
      };

      checkAuthStatus();

      // Pas besoin de nettoyage pour cette fonction
      return () => {};
    }, [])
  );

  // Charger les salons lorsque l'écran est monté
  useEffect(() => {
    loadChatRooms();
  }, []);

  const handleProfileNavigation = async () => {
    // Vérifier si l'utilisateur est connecté
    const loggedIn = await isAuthenticated();

    if (loggedIn) {
      // Si connecté, naviguer vers le profil
      navigation.navigate("ProfileScreen");
    } else {
      // Si non connecté, afficher un message
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour accéder à votre profil.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => navigation.navigate("Login") },
          {
            text: "S'inscrire",
            onPress: () => navigation.navigate("Register"),
          },
        ]
      );
    }
  };

  const navigateToChatRoom = (roomId: string, roomName: string) => {
    // S'assurer que l'ID est toujours un nombre pour le backend
    const numericRoomId = parseInt(roomId, 10);

    // Vérifier que la conversion a réussi
    if (!isNaN(numericRoomId)) {
      // Navigation vers le salon sélectionné avec la valeur convertie comme paramètre
      navigation.navigate("ChatRoom", {
        roomId: numericRoomId, // ID converti en nombre
        roomName: roomName,
      });
    } else {
      // Si la conversion échoue, utiliser l'ID d'origine (cas rares)
      console.warn(
        `Impossible de convertir l'ID du salon ${roomId} en nombre.`
      );
      navigation.navigate("ChatRoom", {
        roomId: roomId, // ID original
        roomName: roomName,
      });
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / windowWidth);
    setActiveIndex(newIndex);
  };

  // Rendu des salons
  const renderChatRooms = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D5A5A" />
          <DefaultText style={styles.loaderText}>
            Chargement des salons...
          </DefaultText>
        </View>
      );
    }

    if (error && chatRooms.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <DefaultText style={styles.errorText}>{error}</DefaultText>
          <TouchableOpacity style={styles.retryButton} onPress={loadChatRooms}>
            <DefaultText style={styles.retryButtonText}>Réessayer</DefaultText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {chatRooms.map((room) => (
            <View key={room.id} style={styles.doorSlide}>
              <DefaultText style={[styles.roomTitle, getTitleStyle(room.type)]}>
                {room.name}
              </DefaultText>
              <TouchableOpacity
                onPress={() => navigateToChatRoom(room.id, room.name)}
                style={styles.doorContainer}
              >
                <Image
                  source={doorImage}
                  style={styles.doorImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.indicatorContainer}>
          {chatRooms.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === activeIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContainer}>
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerButtons}>
            {/* Bouton Explorer */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate("BookList")}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={bookIconImage}
                  style={styles.buttonIcon}
                  resizeMode="contain"
                />
              </View>
              <DefaultText style={styles.navButtonText}>Livres</DefaultText>
            </TouchableOpacity>

            {/* Bouton Découvrir */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate("SwipeList")}
            >
              <View style={styles.iconContainer}>
                <DefaultText style={styles.iconText}>🔎</DefaultText>
              </View>
              <DefaultText style={styles.navButtonText}>Découvrir</DefaultText>
            </TouchableOpacity>

            {/* Afficher soit le bouton de profil, soit le bouton de connexion selon l'état d'authentification */}
            {userIsLoggedIn ? (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleProfileNavigation}
              >
                <View style={styles.iconContainer}>
                  <DefaultText style={styles.iconText}>👤</DefaultText>
                </View>
                <DefaultText style={styles.navButtonText}>Profil</DefaultText>
              </TouchableOpacity>
            ) : (
              <LoginButton />
            )}
          </View>
        </View>

        <View style={styles.carouselContainer}>{renderChatRooms()}</View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  logoImage: {
    height: 40,
    width: 120,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  navButtonText: {
    fontSize: 12,
    color: "#ffffff",
    marginTop: 2,
    fontWeight: "bold",
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(45, 90, 90, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  iconText: {
    fontSize: 18,
  },
  buttonIcon: {
    width: 25,
    height: 25,
  },
  carouselContainer: {
    flex: 1,
  },
  carousel: {
    flex: 1,
  },
  carouselContent: {
    alignItems: "center",
  },
  doorSlide: {
    width: windowWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  roomTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontWeight: "bold",
  },
  doorContainer: {
    width: "80%",
    aspectRatio: 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  doorImage: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 16,
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  retryButton: {
    backgroundColor: "rgba(45, 90, 90, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
  },
});
