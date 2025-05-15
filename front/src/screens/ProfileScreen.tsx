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
    id: '1',
    title: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    cover: "https://m.media-amazon.com/images/I/71F0ceelpUL._SL1500_.jpg",
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    cover: "https://cdn.futura-sciences.com/buildsv6/images/mediumoriginal/4/3/9/439fd5bd7b_50154898_1984.jpg",
  },
  {
    id: '3',
    title: "L'Étranger",
    author: 'Albert Camus',
    cover: "https://media.senscritique.com/media/000007143411/source_big/L_Etranger.jpg",
  },
  {
    id: '4',
    title: 'Les Misérables',
    author: 'Victor Hugo',
    cover: "https://th.bing.com/th/id/R.647d0432f850e14dc7770c93d2b0292d?rik=Pym80KMav5OUvQ&pid=ImgRaw&r=0",
  },
  {
    id: '5',
    title: 'Orgueil et Préjugés',
    author: 'Jane Austen',
    cover: "https://products-images.di-static.com/image/jane-austen-orgueil-et-prejuges/9791093835600-475x500-1.jpg",
  },
  {
    id: '6',
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    cover: "https://static.fnac-static.com/multimedia/images_produits/ZoomPE/8/2/7/9782266201728/tsp20130902084417/Le-Seigneur-des-anneaux.jpg",
  },
  {
    id: '7',
    title: "Harry Potter à l'école des sorciers",
    author: 'J.K. Rowling',
    cover: "https://cdn1.booknode.com/book_cover/5177/full/harry-potter-tome-1-harry-potter-a-lecole-des-sorciers-5176749.jpg",
  },
  {
    id: '8',
    title: 'La Peste',
    author: 'Albert Camus',
    cover: "https://cdn1.booknode.com/book_cover/603/full/la-peste-603432.jpg",
  },
  {
    id: '9',
    title: 'Le Comte de Monte-Cristo',
    author: 'Alexandre Dumas',
    cover:"https://th.bing.com/th/id/OIP.xM7gIuT_qPgu8TYl51_DjAHaMM?cb=iwc2&rs=1&pid=ImgDetMain",
  },
  {
    id: '10',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    cover: "https://static.fnac-static.com/multimedia/Images/FR/NR/5c/b1/9a/10137948/1507-0/tsp20191031070825/Fahrenheit-451.jpg",
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
