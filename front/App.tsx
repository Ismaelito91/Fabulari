import React, { useState, useEffect, ErrorInfo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Font from "expo-font";
import { FONTS } from "./src/constants/fonts";
import DefaultText from "./src/components/DefaultText";

// Importation des écrans
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import BookListScreen from "./src/screens/BookListScreen";
import ChatRoomScreen from "./src/screens/ChatRoomScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import VestiaireScreen from "./src/screens/VestiaireScreen";
import SwipeListScreen from "./src/screens/SwipeListScreen";
import FavoriteBooksScreen from "./src/screens/FavoriteBooksScreen";
import SplashScreen from "./src/screens/SplashScreen";
import LogoutScreen from "./src/screens/LogoutScreen";

// Définition des types pour la navigation
import { RootStackParamList } from "./src/types";

// Gestion des erreurs
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={tempStyles.container}>
          <DefaultText style={tempStyles.text}>
            Une erreur est survenue dans l'application
          </DefaultText>
          <DefaultText style={tempStyles.errorDetails}>
            {this.state.error?.toString()}
          </DefaultText>
        </View>
      );
    }

    return this.props.children;
  }
}

const Stack = createStackNavigator<RootStackParamList>();

// Chargement des polices
const loadFonts = async () => {
  return Font.loadAsync({
    "MillerBanner-Roman": require("./assets/fonts/SpaceMono-Regular.ttf"),
  });
};

const tempStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: "#2D5A5A",
    fontFamily: FONTS.MILLER_BANNER.ROMAN,
  },
  errorDetails: {
    marginTop: 10,
    fontSize: 14,
    color: "red",
    padding: 10,
    maxWidth: "90%",
  },
});

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function prepareFonts() {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Erreur lors du chargement des polices:", e);
        // Enregistrer l'erreur mais continuer quand même
        setError(e instanceof Error ? e : new Error("Erreur inconnue"));
        setFontsLoaded(true);
      }
    }

    prepareFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={tempStyles.container}>
        <ActivityIndicator size="large" color="#2D5A5A" />
        <DefaultText style={tempStyles.text}>
          Chargement de l'application...
        </DefaultText>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: "#6200ee" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
              fontFamily: FONTS.MILLER_BANNER.ROMAN,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Connexion" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Inscription" }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: "Profil" }}
          />
          <Stack.Screen
            name="BookList"
            component={BookListScreen}
            options={{ title: "Liste des livres" }}
          />
          <Stack.Screen
            name="SwipeList"
            component={SwipeListScreen}
            options={{ title: "Liste de swipe" }}
          />
          <Stack.Screen
            name="FavoriteBooks"
            component={FavoriteBooksScreen}
            options={{ title: "Livres favoris" }}
          />
          <Stack.Screen
            name="Vestiaire"
            component={VestiaireScreen}
            options={{ title: "Vestiaire" }}
          />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{ title: "Salle de chat" }}
          />
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Logout"
            component={LogoutScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
