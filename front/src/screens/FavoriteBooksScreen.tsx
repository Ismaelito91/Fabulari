import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoriteBooksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "FavoriteBooks">;
};

// Type pour un livre
type Book = {
  id: string;
  title: string;
  author: string;
  cover: any; // URL de l'image ou ressource locale
  readDate?: string;
  rating?: number;
};

const FavoriteBooksScreen: React.FC<FavoriteBooksScreenProps> = ({
  navigation,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configurer la navigation
    navigation.setOptions({
      title: "Mes Livres Lus",
      headerTintColor: "#FFFFFF",
      headerStyle: {
        backgroundColor: "#2D5A5A",
      },
    });

    // Fonction pour charger les livres favoris
    const loadFavoriteBooks = async () => {
      try {
        setIsLoading(true);

        // En production, vous feriez un appel API ici pour récupérer les livres favoris de l'utilisateur
        // const userToken = await AsyncStorage.getItem('userToken');
        // const response = await fetch(`${API_URL}/books/favorites`, {
        //   headers: { Authorization: `Bearer ${userToken}` }
        // });
        // const data = await response.json();
        // setBooks(data);

        // Pour l'exemple, nous utilisons des données fictives
        setTimeout(() => {
          setBooks([
            {
              id: "1",
              title: "Le Petit Prince",
              author: "Antoine de Saint-Exupéry",
              cover: require("../assets/Fichier 10.png"),
              readDate: "10/03/2023",
              rating: 5,
            },
            {
              id: "2",
              title: "Harry Potter à l'École des Sorciers",
              author: "J.K. Rowling",
              cover: require("../assets/Fichier 11.png"),
              readDate: "25/04/2023",
              rating: 4,
            },
            {
              id: "3",
              title: "L'Alchimiste",
              author: "Paulo Coelho",
              cover: require("../assets/Fichier 13.png"),
              readDate: "12/06/2023",
              rating: 5,
            },
            {
              id: "4",
              title: "1984",
              author: "George Orwell",
              cover: require("../assets/Fichier 14.png"),
              readDate: "01/07/2023",
              rating: 4,
            },
            {
              id: "5",
              title: "Notre-Dame de Paris",
              author: "Victor Hugo",
              cover: require("../assets/Fichier 15.png"),
              readDate: "15/08/2023",
              rating: 3,
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Erreur lors du chargement des livres:", err);
        setError(
          "Impossible de charger vos livres favoris. Veuillez réessayer plus tard."
        );
        setIsLoading(false);
      }
    };

    loadFavoriteBooks();
  }, [navigation]);

  // Rendu d'un élément de livre
  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => {
        // Navigation vers les détails du livre (à implémenter)
        // navigation.navigate('BookDetails', { bookId: item.id });
      }}
    >
      <Image source={item.cover} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        {item.readDate && (
          <Text style={styles.bookDate}>Lu le: {item.readDate}</Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Note: </Text>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Text
                  key={index}
                  style={
                    item.rating && index < item.rating
                      ? styles.starFilled
                      : styles.star
                  }
                >
                  ★
                </Text>
              ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Affichage du chargement
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2D5A5A" />
        <Text style={styles.loadingText}>Chargement de vos livres...</Text>
      </View>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setError(null);
            // Recharger les livres...
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage de la liste des livres
  return (
    <SafeAreaView style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore de livres lus
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("BookList")}
          >
            <Text style={styles.browseButtonText}>
              Parcourir la bibliothèque
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2D5A5A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 20,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: "#2D5A5A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 5,
    marginRight: 15,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  bookDate: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#888888",
  },
  star: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  starFilled: {
    fontSize: 14,
    color: "#FFC107",
  },
});

export default FavoriteBooksScreen;
