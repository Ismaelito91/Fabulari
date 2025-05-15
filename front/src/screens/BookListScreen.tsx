import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Button,
} from "react-native";

const books = [
  {
    id: "1",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    image: "https://m.media-amazon.com/images/I/81t2CVWEsUL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    image: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg",
  },
  {
    id: "3",
    title: "L'Étranger",
    author: "Albert Camus",
    image: "https://m.media-amazon.com/images/I/51kP1d3xalL._SX324_BO1,204,203,200_.jpg",
  },
  {
    id: "4",
    title: "Les Misérables",
    author: "Victor Hugo",
    image: "https://m.media-amazon.com/images/I/71wBcp3hLPL.jpg",
  },
  {
    id: "5",
    title: "Orgueil et Préjugés",
    author: "Jane Austen",
    image: "https://m.media-amazon.com/images/I/81IYF5oN8rL.jpg",
  },
  {
    id: "6",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    image: "https://m.media-amazon.com/images/I/91zr3c5bXkL.jpg",
  },
  {
    id: "7",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    image: "https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg",
  },
  {
    id: "8",
    title: "La Peste",
    author: "Albert Camus",
    image: "https://m.media-amazon.com/images/I/61Eq1oP9W0L.jpg",
  },
  {
    id: "9",
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    image: "https://m.media-amazon.com/images/I/81Lr3RVx6HL.jpg",
  },
  {
    id: "10",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    image: "https://m.media-amazon.com/images/I/81GqtNbs+PL.jpg",
  },
  {
    id: "11",
    title: "Bel-Ami",
    author: "Guy de Maupassant",
    image: "https://m.media-amazon.com/images/I/61FnE8U2HBL.jpg",
  },
  {
    id: "12",
    title: "Madame Bovary",
    author: "Gustave Flaubert",
    image: "https://m.media-amazon.com/images/I/71UkZDPoTqL.jpg",
  },
];

export default function BookListScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📚 Liste des livres</Text>
      <Button
        title="Retour à l'accueil"
        onPress={() => {
          if (navigation?.navigate) {
            navigation.navigate("Home");
          }
        }}
      />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookContainer}>
            <Image source={{ uri: item.image }} style={styles.bookImage} />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  bookContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
  },
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
    flexShrink: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#555",
  },
});
