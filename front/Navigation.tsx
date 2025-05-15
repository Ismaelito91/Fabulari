import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import BookListScreen from "./src/screens/BookListScreen";
import SwipeListScreen from "./src/screens/SwipeListScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import VestiaireScreen from "./src/screens/VestiaireScreen";
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ChatRoomScreen from "./src/screens/ChatRoomScreen";
import LogoutScreen from "./src/screens/LogoutScreen";
import { RootStackParamList } from "./src/types"; // 🛑 important !!

const Stack = createStackNavigator<RootStackParamList>();

// Créer un groupe de navigation pour les écrans nécessitant une authentification
const AuthenticatedStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="SwipeList" component={SwipeListScreen} />
      <Stack.Screen name="Vestiaire" component={VestiaireScreen} />
    </Stack.Navigator>
  );
};

// Créer un groupe de navigation pour l'authentification
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Splash screen qui redirige vers Home */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Écrans d'authentification */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Écrans principaux avec en-tête visible */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookList"
          component={BookListScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            headerShown: true,
            // On peut ajouter une logique de vérification d'authentification ici
          }}
        />
        <Stack.Screen
          name="SwipeList"
          component={SwipeListScreen}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Vestiaire"
          component={VestiaireScreen}
          options={{ headerShown: true }}
        />

        {/* Écran de salon de chat */}
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={{
            headerShown: true,
            // Les options de navigation sont définies dynamiquement dans le composant
          }}
        />

        {/* Écran de déconnexion et de gestion du compte */}
        <Stack.Screen
          name="Logout"
          component={LogoutScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            // Empêcher le retour à l'écran précédent
            animationEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
