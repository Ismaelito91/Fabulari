import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: any; // à remplacer par ImageSourcePropType si possible
}

interface BookSelectionModalProps {
  visible: boolean;
  allBooks: Book[];
  favoriteBooks: Book[];
  onToggleFavorite: (book: Book) => void;
  onClose: () => void;
}

const BookSelectionModal: React.FC<BookSelectionModalProps> = ({
  visible,
  allBooks,
  favoriteBooks,
  onToggleFavorite,
  onClose,
}) => {
  const handleToggleFavorite = (book: Book) => {
    const isFavorite = favoriteBooks.some((item) => item.id === book.id);
    if (isFavorite) {
      onToggleFavorite(book);
    } else if (favoriteBooks.length < 3) {
      onToggleFavorite(book);
    } else {
      Alert.alert('Limite atteinte', 'Vous pouvez sélectionner jusqu\'à 3 livres favoris.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContent}>
        <Text style={styles.sectionTitle}>Ajouter un livre à mes favoris</Text>

        <FlatList
          data={allBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isFavorite = favoriteBooks.some((fav) => fav.id === item.id);
            return (
              <TouchableOpacity
                style={styles.bookItem}
                onPress={() => handleToggleFavorite(item)}
              >
                <Image source={item.cover} style={styles.bookCover} />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.author}>de {item.author}</Text>
                </View>
                {isFavorite && <Ionicons name="heart" size={24} color="red" />}
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookCover: {
    width: 60,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 15,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookSelectionModal;

