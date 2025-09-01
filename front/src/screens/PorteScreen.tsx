import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<{ PorteScreen: { porte: string } }, 'PorteScreen'>;

export default function PorteScreen({ route, navigation }: Props) {
  const { porte } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans {porte} 🚪</Text>
      <Button title="Retour" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
});
