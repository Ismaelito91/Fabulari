import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

// Définition des types pour la navigation
type RootStackParamList = {
  FavoriteBooks: undefined;
  ProfileScreen: undefined;
};

type FavoriteBooksScreenNavigationProp = StackNavigationProp<RootStackParamList, "FavoriteBooks">;
type FavoriteBooksScreenRouteProp = RouteProp<RootStackParamList, "FavoriteBooks">;

interface Props {
  navigation: FavoriteBooksScreenNavigationProp;
  route: FavoriteBooksScreenRouteProp;
}

const books = [
  { id: "1", title: "Fourth Wing", author: "Rebecca Yarros", cover: require("../assets/Fichier 28.png") },
  { id: "2", title: "Le Pont Des Tempêtes", author: "Danielle L. Jensen", cover: require("../assets/Fichier 28.png") },
  { id: "3", title: "Un palais d’épines et de roses", author: "Sarah J. Maas", cover: require("../assets/Fichier 28.png") }
];

const FavoriteBooksScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const toggleSelection = (bookId: string) => {
    setSelectedBooks((prevSelected) => {
      if (prevSelected.includes(bookId)) {
        return prevSelected.filter(id => id !== bookId);
      } else if (prevSelected.length < 3) {
        return [...prevSelected, bookId];
      }
      return prevSelected;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisis tes 3 livres favoris</Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const isSelected = selectedBooks.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.bookItem, isSelected && styles.selected]}
              onPress={() => toggleSelection(item.id)}
            >
              <Image source={item.cover} style={styles.bookCover} />
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={() => navigation.goBack()} disabled={selectedBooks.length < 3}>
        <Text style={styles.confirmButtonText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  bookItem: { flex: 1, alignItems: "center", margin: 10, padding: 10, borderRadius: 10, borderWidth: 2, borderColor: "#ddd" },
  selected: { borderColor: "#6200ee", borderWidth: 3 },
  bookCover: { width: 80, height: 120, marginBottom: 8 },
  bookTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  author: { fontSize: 14, color: "gray", textAlign: "center" },
  confirmButton: { backgroundColor: "#6200ea", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default FavoriteBooksScreen;
