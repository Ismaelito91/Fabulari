import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';

// Type d’un livre (à centraliser dans un fichier types.ts si nécessaire)
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: ImageSourcePropType;
}

interface FavoriteBooksProps {
  favoriteBooks: Book[];
  onModifyPress: () => void;
}

const FavoriteBooks: React.FC<FavoriteBooksProps> = ({ favoriteBooks, onModifyPress }) => {
  return (
    <View style={styles.booksSection}>
      <View style={styles.booksSectionHeader}>
        <Text style={styles.sectionTitle}>Mes livres préférés</Text>
        <TouchableOpacity style={styles.modifyButton} onPress={onModifyPress}>
          <Text style={styles.modifyButtonText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.booksListContainer}>
        {favoriteBooks.length > 0 ? (
          favoriteBooks.map((item) => (
            <BookItem key={item.id} book={item} />
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun livre favori sélectionné.</Text>
        )}
      </View>
    </View>
  );
};

// Sous-composant : un livre individuel
interface BookItemProps {
  book: Book;
}

const BookItem: React.FC<BookItemProps> = ({ book }) => {
  return (
    <View style={styles.bookItem}>
      <Image source={book.cover} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>de {book.author}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  booksSection: {
    marginBottom: 20,
  },
  booksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modifyButton: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 5,
  },
  modifyButtonText: {
    color: 'white',
    fontSize: 16,
  },
  booksListContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  bookItem: {
    width: '30%',
    marginRight: '3%',
    marginBottom: 10,
    alignItems: 'center',
  },
  bookCover: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  bookInfo: {
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  author: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    padding: 10,
  },
});

export default FavoriteBooks;
