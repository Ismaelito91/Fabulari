import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importation des écrans
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import RoomsScreen from "./src/screens/RoomsScreen";
import ChatScreen from "./src/screens/ChatScreen";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Rooms: undefined;
  Chat: { roomId: number; roomName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#6200ee" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
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
          name="Rooms"
          component={RoomsScreen}
          options={{ title: "Salles" }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}
