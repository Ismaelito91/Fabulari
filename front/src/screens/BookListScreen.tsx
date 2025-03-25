import React from "react";
import { View, Text, Button, FlatList, Image, StyleSheet } from "react-native";

const books = [
  {
    id: "1",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    image: "https://m.media-amazon.com/images/I/81t2CVWEsUL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    image: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg"
  },
  {
    id: "3",
    title: "L'Étranger",
    author: "Albert Camus",
    image: "https://m.media-amazon.com/images/I/51kP1d3xalL._SX324_BO1,204,203,200_.jpg"
  }
];

export default function BookListScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Liste des livres</Text>
      <Button 
        title="Retour à l'accueil" 
        onPress={() => navigation.navigate('Home')} // Naviguer vers HomeScreen
      />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Image source={{ uri: item.image }} style={styles.bookImage} />
            <View>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  bookContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 16,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookAuthor: {
    fontSize: 14,
    color: "gray",
  },
});
