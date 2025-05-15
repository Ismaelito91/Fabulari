import React, { useState } from 'react';
import { View, StyleSheet ,Image, } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Importation des composants
import ProfileHeader from '../components/Profile/ProfileHeader';
import UserInfo from '../components/Profile/UserInfo';
import FavoriteBooks from '../components/Profile/FavoriteBooks';
import ProgressSection from '../components/Profile/ProgressSection';
import PseudoEditModal from '../components/Profile/PseudoEditModal';
import BookSelectionModal from '../components/Profile/BookSelectionModal';

// Type pour les livres
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: any; // Peut être remplacé par ImageSourcePropType si besoin
}

// Type pour l'avatar
export interface AvatarData {
  id: number;
  userId: number;
  hair: string;
  face: string;
  eyes: string;
  outfit: string;
  accessories: string;
  currentX: number;
  currentY: number;
}

// Données de livres (peut être déplacé plus tard)
export const allBooks: Book[] = [
  {
    id: "1",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    cover: "https://m.media-amazon.com/images/I/81t2CVWEsUL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    cover: "https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg",
  },
  {
    id: "3",
    title: "L'Étranger",
    author: "Albert Camus",
    cover: "https://m.media-amazon.com/images/I/51kP1d3xalL._SX324_BO1,204,203,200_.jpg",
  },
  {
    id: "4",
    title: "Les Misérables",
    author: "Victor Hugo",
    cover: "https://m.media-amazon.com/images/I/71wBcp3hLPL.jpg",
  },
  {
    id: "5",
    title: "Orgueil et Préjugés",
    author: "Jane Austen",
    cover: "https://m.media-amazon.com/images/I/81IYF5oN8rL.jpg",
  },
  {
    id: "6",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    cover: "https://m.media-amazon.com/images/I/91zr3c5bXkL.jpg",
  },
  {
    id: "7",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    cover: "https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg",
  },
  {
    id: "8",
    title: "La Peste",
    author: "Albert Camus",
    cover: "https://m.media-amazon.com/images/I/61Eq1oP9W0L.jpg",
  },
  {
    id: "9",
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    cover: "https://m.media-amazon.com/images/I/81Lr3RVx6HL.jpg",
  },
  {
    id: "10",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    cover: "https://m.media-amazon.com/images/I/81GqtNbs+PL.jpg",
  },
  {
    id: "11",
    title: "Bel-Ami",
    author: "Guy de Maupassant",
    cover: "https://m.media-amazon.com/images/I/61FnE8U2HBL.jpg",
  },
  {
    id: "12",
    title: "Madame Bovary",
    author: "Gustave Flaubert",
    cover: "https://m.media-amazon.com/images/I/71UkZDPoTqL.jpg",
  },
];

// Données initiales de l'avatar
const initialAvatarData: AvatarData = {
  id: 1,
  userId: 1,
  hair: 'style1',
  face: 'style1',
  eyes: 'blue',
  outfit: 'casual',
  accessories: 'glasses',
  currentX: 0,
  currentY: 0,
};

const ProfileScreen: React.FC = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(allBooks.slice(0, 2));
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pseudoModalVisible, setPseudoModalVisible] = useState<boolean>(false);
  const [pseudo, setPseudo] = useState<string>('Lecteur123');
  const [avatarData, setAvatarData] = useState<AvatarData>(initialAvatarData);

  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <View style={styles.container}>
      <ProfileHeader />

      <UserInfo
        pseudo={pseudo}
        onPseudoEdit={() => setPseudoModalVisible(true)}
        onWardrobePress={() => navigation.navigate('Vestiaire')}
      />

      <FavoriteBooks
        favoriteBooks={favoriteBooks}
        onModifyPress={() => setModalVisible(true)}
      />

      <ProgressSection />

      <PseudoEditModal
        visible={pseudoModalVisible}
        currentPseudo={pseudo}
        onSave={(newPseudo: string) => {
          setPseudo(newPseudo);
          setPseudoModalVisible(false);
        }}
        onClose={() => setPseudoModalVisible(false)}
      />

      <BookSelectionModal
        visible={modalVisible}
        allBooks={allBooks}
        favoriteBooks={favoriteBooks}
        onToggleFavorite={(book: Book) => {
          if (favoriteBooks.some(item => item.id === book.id)) {
            setFavoriteBooks(favoriteBooks.filter(item => item.id !== book.id));
          } else if (favoriteBooks.length < 3) {
            setFavoriteBooks([...favoriteBooks, book]);
          }
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    position: 'relative',
  },
});

export default ProfileScreen;
