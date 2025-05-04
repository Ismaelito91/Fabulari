import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types'; // adapte le chemin selon où est ton fichier types

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenue sur Fabulari 📚</Text>

      <Button 
        title="Voir la liste des livres" 
        onPress={() => navigation.navigate('BookList')}
      />

      <Button 
        title="Aller au Profil" 
        onPress={() => navigation.navigate('ProfileScreen')}
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
