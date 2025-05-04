import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import UnlockableItems from '../components/UnlockableItems';
import { useNavigation } from '@react-navigation/native';
import DynamicAvatar from '../components/Avatar'; // Ajustez le chemin si nécessaire

// Import correct de l'icône des paramètres
const settingsIcon = require('../assets/Fichier 3.png');

// Type pour les livres
interface Book {
  id: string;
  title: string;
  author: string;
  cover: any;
}

// Type pour l'avatar basé sur votre modèle Sequelize
interface AvatarData {
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

// Données de test pour l'avatar
const initialAvatarData: AvatarData = {
  id: 1,
  userId: 1,
  hair: 'style1',
  face: 'style1',
  eyes: 'blue',
  outfit: 'casual',
  accessories: 'glasses',
  currentX: 0,
  currentY: 0
};

const allBooks: Book[] = [
  { id: '1', title: 'Fourth Wing', author: 'Rebecca Yarros', cover: require('../assets/Fichier 28.png') },
  { id: '2', title: 'Le Pont Des Tempêtes', author: 'Danielle L. Jensen', cover: require('../assets/Fichier 28.png') },
  { id: '3', title: 'Un palais d\'épines et de roses', author: 'Sarah J. Maas', cover: require('../assets/Fichier 28.png') },
];

function ProfileScreen({ route }: { route: any }) {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(allBooks);
  const [modalVisible, setModalVisible] = useState(false);
  const [pseudoModalVisible, setPseudoModalVisible] = useState(false);
  const [pseudo, setPseudo] = useState('Lecteur123');
  const [tempPseudo, setTempPseudo] = useState('');
  const [avatarData, setAvatarData] = useState<AvatarData>(initialAvatarData);
  const navigation = useNavigation();

  // Fonction pour ajouter ou retirer un livre des favoris
  const toggleFavorite = (book: Book) => {
    if (favoriteBooks.some((item) => item.id === book.id)) {
      setFavoriteBooks(favoriteBooks.filter((item) => item.id !== book.id));
    } else {
      if (favoriteBooks.length < 3) {
        setFavoriteBooks([...favoriteBooks, book]);
      } else {
        Alert.alert('Limite atteinte', 'Vous pouvez sélectionner jusqu\'à 3 livres favoris.');
      }
    }
  };

  const openPseudoModal = () => {
    setTempPseudo(pseudo);
    setPseudoModalVisible(true);
  };

  const savePseudo = () => {
    if (tempPseudo.trim()) {
      setPseudo(tempPseudo);
      setPseudoModalVisible(false);
    } else {
      Alert.alert('Erreur', 'Le pseudo ne peut pas être vide');
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Options')}>
            <Ionicons name="ellipsis-vertical" size={24} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Paramètres')}>
            <Image source={settingsIcon} style={styles.iconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#777" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE SECTION WITH EDITABLE PSEUDO */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={openPseudoModal} style={styles.pseudoContainer}>
          <Text style={styles.profileTitle}>{pseudo}</Text>
          <Ionicons name="pencil" size={16} color="#4CAF50" style={styles.editIcon} />
        </TouchableOpacity>
        
        {/* Avatar avec bouton Vestiaire */}
        <View style={styles.avatarContainer}>
          <DynamicAvatar />
          <TouchableOpacity style={styles.wardrobeButton} onPress={() => navigation.navigate('Vestiaire')}>
            <Ionicons name="shirt-outline" size={22} color="white" />
          </TouchableOpacity>
          {/* Pour lancer l app enleve touchableOpacity  */}
        </View>
      </View>

      {/* BOOKS SECTION - Taille réduite */}
      <View style={styles.booksSection}>
        <View style={styles.booksSectionHeader}>
          <Text style={styles.sectionTitle}>Mes livres préférés</Text>
          <TouchableOpacity style={styles.modifyButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.modifyButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>
        
        {/* Liste des livres favoris avec hauteur fixe */}
        <View style={styles.booksListContainer}>
          {favoriteBooks.map((item) => (
            <View key={item.id} style={styles.bookItem}>
              <Image source={item.cover} style={styles.bookCover} />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.author} numberOfLines={1}>de {item.author}</Text>
              </View>
            </View>
          ))}
          {favoriteBooks.length === 0 && (
            <Text style={styles.emptyText}>Aucun livre favori sélectionné.</Text>
          )}
        </View>
      </View>

      {/* PROGRESS BAR AND UNLOCKABLE ITEMS - Position absolue en bas */}
      <View style={styles.progressSection}>
        <View style={styles.progressContainer}>
          <Ionicons name="heart" size={24} color="red" style={styles.heartIcon} />
          <ProgressBar />
        </View>
        <Text style={styles.unlockableTitle}>Vos prochains items à débloquer :</Text>
        <UnlockableItems />
      </View>

      {/* Modal pour modifier le pseudo */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={pseudoModalVisible}
        onRequestClose={() => setPseudoModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Modifier votre pseudo</Text>
            <TextInput
              style={styles.input}
              onChangeText={setTempPseudo}
              value={tempPseudo}
              placeholder="Entrez votre nouveau pseudo"
              maxLength={20}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setPseudoModalVisible(false)}
              >
                <Text style={styles.textStyle}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={savePseudo}
              >
                <Text style={styles.textStyle}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour ajouter un livre */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Ajouter un livre à mes favoris</Text>
          
          <FlatList
            data={allBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.bookItem} onPress={() => toggleFavorite(item)}>
                <Image source={item.cover} style={styles.bookCover} />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.author}>de {item.author}</Text>
                </View>
                {favoriteBooks.some((fav) => fav.id === item.id) && (
                  <Ionicons name="heart" size={24} color="red" />
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    position: 'relative', // Pour positionner les éléments absolus
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pseudoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  editIcon: {
    marginLeft: 8,
  },
  avatarContainer: {
    marginTop: 16,
    alignItems: 'center',
    position: 'relative',
  },
  wardrobeButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 50,
  },
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
    flexWrap: 'wrap',
  },
  bookItem: {
    width: '30%',
    marginRight: '5%',
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
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  progressSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heartIcon: {
    marginRight: 10,
  },
  unlockableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalView: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  buttonCancel: {
    backgroundColor: '#ccc',
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ProfileScreen;
