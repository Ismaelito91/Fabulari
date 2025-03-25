import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenue sur Fabulari 📚</Text>
      <Button 
        title="Voir la liste des livres" 
        onPress={() => navigation.navigate('BookList')} // Naviguer vers BookListScreen
      />
      <Button 
        title="test" 
        onPress={() => navigation.navigate('ProfileScreen')} // Naviguer vers 
      />
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
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
