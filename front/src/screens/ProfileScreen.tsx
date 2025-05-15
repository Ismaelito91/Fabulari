import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "../components/ProgressBar";
import UnlockableItems from "../components/UnlockableItems";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import DynamicAvatar from "../components/Avatar"; // Ajustez le chemin si nécessaire
import { RootStackParamList } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../utils/authUtils";

// Import correct de l'icône des paramètres
const settingsIcon = require("../assets/Fichier 3.png");

// Type pour les livres
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: any; // Peut être remplacé par ImageSourcePropType si besoin
  isLocal?: boolean; // Pour distinguer les images locales des URLs
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
  type: string; // "boy" ou "girl"
  currentX: number;
  currentY: number;
}

// Interface pour les données utilisateur
interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  avatar?: AvatarData;
  [key: string]: any; // Pour les autres propriétés potentielles
}

// Livres avec des URLs d'image
export const allBooks: Book[] = [
  {
    id: "1",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    cover: "https://m.media-amazon.com/images/I/71F0ceelpUL._SL1500_.jpg",
    isLocal: false,
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    cover:
      "https://cdn.futura-sciences.com/buildsv6/images/mediumoriginal/4/3/9/439fd5bd7b_50154898_1984.jpg",
    isLocal: false,
  },
  {
    id: "3",
    title: "L'Étranger",
    author: "Albert Camus",
    cover:
      "https://media.senscritique.com/media/000007143411/source_big/L_Etranger.jpg",
    isLocal: false,
  },
  {
    id: "4",
    title: "Les Misérables",
    author: "Victor Hugo",
    cover:
      "https://th.bing.com/th/id/R.647d0432f850e14dc7770c93d2b0292d?rik=Pym80KMav5OUvQ&pid=ImgRaw&r=0",
    isLocal: false,
  },
  {
    id: "5",
    title: "Orgueil et Préjugés",
    author: "Jane Austen",
    cover:
      "https://products-images.di-static.com/image/jane-austen-orgueil-et-prejuges/9791093835600-475x500-1.jpg",
    isLocal: false,
  },
  {
    id: "6",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    cover:
      "https://static.fnac-static.com/multimedia/images_produits/ZoomPE/8/2/7/9782266201728/tsp20130902084417/Le-Seigneur-des-anneaux.jpg",
    isLocal: false,
  },
  {
    id: "7",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    cover:
      "https://cdn1.booknode.com/book_cover/5177/full/harry-potter-tome-1-harry-potter-a-lecole-des-sorciers-5176749.jpg",
    isLocal: false,
  },
  {
    id: "8",
    title: "La Peste",
    author: "Albert Camus",
    cover: "https://cdn1.booknode.com/book_cover/603/full/la-peste-603432.jpg",
    isLocal: false,
  },
  {
    id: "9",
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    cover:
      "https://th.bing.com/th/id/OIP.xM7gIuT_qPgu8TYl51_DjAHaMM?cb=iwc2&rs=1&pid=ImgDetMain",
    isLocal: false,
  },
  {
    id: "10",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    cover:
      "https://static.fnac-static.com/multimedia/Images/FR/NR/5c/b1/9a/10137948/1507-0/tsp20191031070825/Fahrenheit-451.jpg",
    isLocal: false,
  },
  {
    id: "11",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    cover: require("../assets/Fichier 28.png"),
    isLocal: true,
  },
  {
    id: "12",
    title: "Le Pont Des Tempêtes",
    author: "Danielle L. Jensen",
    cover: require("../assets/Fichier 28.png"),
    isLocal: true,
  },
  {
    id: "13",
    title: "Un palais d'épines et de roses",
    author: "Sarah J. Maas",
    cover: require("../assets/Fichier 28.png"),
    isLocal: true,
  },
];

// Données initiales de l'avatar
const initialAvatarData: AvatarData = {
  id: 1,
  userId: 1,
  hair: "default",
  face: "default",
  eyes: "default",
  outfit: "default",
  accessories: "default",
  type: "boy", // default avatar type
  currentX: 0,
  currentY: 0,
};

// Composant modal pour la modification du pseudo
interface PseudoModalProps {
  visible: boolean;
  currentPseudo: string;
  onSave: (newPseudo: string) => void;
  onClose: () => void;
}

const PseudoModal: React.FC<PseudoModalProps> = ({
  visible,
  currentPseudo,
  onSave,
  onClose,
}) => {
  const [tempPseudo, setTempPseudo] = useState(currentPseudo);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
              onPress={onClose}
            >
              <Text style={styles.textStyle}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={() => onSave(tempPseudo)}
            >
              <Text style={styles.textStyle}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Composant modal pour la sélection de livres
interface BookSelectionModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

const BookSelectionModal: React.FC<BookSelectionModalProps> = ({
  visible,
  onRequestClose,
  children,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      {children}
    </Modal>
  );
};

// Composant modal pour la sélection d'avatar
interface AvatarSelectionModalProps {
  visible: boolean;
  currentAvatarType: string;
  onSave: (type: string) => void;
  onClose: () => void;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  visible,
  currentAvatarType,
  onSave,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState(currentAvatarType);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { width: "90%" }]}>
          <Text style={styles.modalTitle}>Choisir votre avatar</Text>
          <View style={styles.avatarSelectionContainer}>
            <TouchableOpacity
              style={[
                styles.avatarOption,
                selectedType === "boy" && styles.selectedAvatarOption,
              ]}
              onPress={() => setSelectedType("boy")}
            >
              <Image
                source={require("../assets/Chibi_garcon1.png")}
                style={styles.avatarSelectionImage}
              />
              <Text style={styles.avatarSelectionText}>Garçon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.avatarOption,
                selectedType === "girl" && styles.selectedAvatarOption,
              ]}
              onPress={() => setSelectedType("girl")}
            >
              <Image
                source={require("../assets/Fille-1.png")}
                style={styles.avatarSelectionImage}
              />
              <Text style={styles.avatarSelectionText}>Fille</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textStyle}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={() => onSave(selectedType)}
            >
              <Text style={styles.textStyle}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

function ProfileScreen({ route }: { route: any }) {
  // Utiliser le type correct pour la navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(
    allBooks.slice(0, 3)
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [pseudoModalVisible, setPseudoModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [pseudo, setPseudo] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [avatar, setAvatar] = useState<AvatarData>(initialAvatarData);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    loadUserData();
  }, []);

  // Fonction pour charger les données utilisateur
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userDataStr = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("userToken");

      if (userDataStr) {
        const parsedUserData = JSON.parse(userDataStr);
        setUserData(parsedUserData);

        // Vérifier si le nom est défini dans userData
        if (parsedUserData.name) {
          setPseudo(parsedUserData.name);
          console.log(
            "Nom d'utilisateur chargé depuis le stockage local:",
            parsedUserData.name
          );
        } else {
          // Utiliser une valeur par défaut si le nom n'est pas défini
          setPseudo("Lecteur123");
          console.log("Aucun nom trouvé, utilisation du nom par défaut");
        }

        // Obtenir les données utilisateur depuis le backend si un token est disponible
        if (token && parsedUserData.id) {
          try {
            // Récupérer les données utilisateur complètes depuis le backend
            const userResponse = await axios.get(
              `${API_BASE_URL}/users/${parsedUserData.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Si la réponse contient un nom d'utilisateur, le mettre à jour
            if (userResponse.data && userResponse.data.name) {
              setPseudo(userResponse.data.name);
              console.log(
                "Nom d'utilisateur récupéré depuis le backend:",
                userResponse.data.name
              );

              // Mettre à jour les données utilisateur locales si le nom a changé
              if (parsedUserData.name !== userResponse.data.name) {
                const updatedUserData = {
                  ...parsedUserData,
                  name: userResponse.data.name,
                };
                setUserData(updatedUserData);
                await AsyncStorage.setItem(
                  "userData",
                  JSON.stringify(updatedUserData)
                );
                console.log(
                  "Données utilisateur mises à jour localement avec le nom du backend"
                );
              }
            }

            // Obtenir les données d'avatar de l'utilisateur
            const avatarResponse = await axios.get(
              `${API_BASE_URL}/users/${parsedUserData.id}/avatar`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (avatarResponse.data && avatarResponse.data.avatar) {
              setAvatar(avatarResponse.data.avatar);
              console.log("Avatar récupéré depuis le backend");
            } else if (parsedUserData.avatar) {
              // Utiliser l'avatar stocké localement si disponible
              setAvatar(parsedUserData.avatar);
              console.log("Avatar chargé depuis le stockage local");
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération des données utilisateur:",
              error
            );
            // Continuer à utiliser les données locales en cas d'erreur
            if (parsedUserData.avatar) {
              setAvatar(parsedUserData.avatar);
            }
          }
        } else if (parsedUserData.avatar) {
          // Utiliser l'avatar stocké localement si disponible mais pas de token
          setAvatar(parsedUserData.avatar);
        }
      } else {
        // Aucune donnée utilisateur trouvée
        setPseudo("Lecteur123");
        console.log(
          "Aucune donnée utilisateur trouvée, utilisation des valeurs par défaut"
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données utilisateur:",
        error
      );
      // En cas d'erreur, utiliser des valeurs par défaut
      setPseudo("Lecteur123");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour ajouter ou retirer un livre des favoris
  const toggleFavorite = (book: Book) => {
    if (favoriteBooks.some((item) => item.id === book.id)) {
      setFavoriteBooks(favoriteBooks.filter((item) => item.id !== book.id));
    } else {
      if (favoriteBooks.length < 3) {
        setFavoriteBooks([...favoriteBooks, book]);
      } else {
        Alert.alert(
          "Limite atteinte",
          "Vous pouvez sélectionner jusqu'à 3 livres favoris."
        );
      }
    }
  };

  const openPseudoModal = () => {
    setPseudoModalVisible(true);
  };

  const savePseudo = async (newPseudo: string) => {
    if (newPseudo.trim()) {
      setPseudo(newPseudo);
      setPseudoModalVisible(false);

      // Mettre à jour les données utilisateur localement
      if (userData) {
        const updatedUserData = { ...userData, name: newPseudo };
        setUserData(updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));

        // Si un token est disponible, mettre à jour le pseudo sur le backend
        const token = await AsyncStorage.getItem("userToken");
        if (token && userData.id) {
          try {
            await axios.put(
              `${API_BASE_URL}/users/${userData.id}`,
              { name: newPseudo },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error("Erreur lors de la mise à jour du pseudo:", error);
          }
        }
      }
    } else {
      Alert.alert("Erreur", "Le pseudo ne peut pas être vide");
    }
  };

  const openAvatarModal = () => {
    setAvatarModalVisible(true);
  };

  const saveAvatar = async (avatarType: string) => {
    try {
      // Mettre à jour l'avatar localement
      const updatedAvatar = { ...avatar, type: avatarType };
      setAvatar(updatedAvatar);
      setAvatarModalVisible(false);

      // Mettre à jour l'avatar dans les données utilisateur
      if (userData) {
        const updatedUserData = { ...userData, avatar: updatedAvatar };
        setUserData(updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));

        // Si un token est disponible, mettre à jour l'avatar sur le backend
        const token = await AsyncStorage.getItem("userToken");
        if (token && userData.id) {
          try {
            await axios.put(
              `${API_BASE_URL}/users/${userData.id}/avatar`,
              { avatar: updatedAvatar },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error("Erreur lors de la mise à jour de l'avatar:", error);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'avatar:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la sauvegarde de l'avatar."
      );
    }
  };

  // Fonction pour afficher une image en fonction de son type (locale ou URL)
  const renderBookCover = (book: Book) => {
    if (book.isLocal) {
      // Image locale
      return <Image source={book.cover} style={styles.bookCover} />;
    } else {
      // URL d'image
      return (
        <Image
          source={{ uri: book.cover as string }}
          style={styles.bookCover}
          // Ajouter un placeholder en cas d'échec de chargement
          defaultSource={require("../assets/Fichier 28.png")}
        />
      );
    }
  };

  // Afficher un indicateur de chargement si les données sont en cours de chargement
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#2D5A5A" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => console.log("Options")}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#777" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => console.log("Paramètres")}
          >
            <Image source={settingsIcon} style={styles.iconImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => console.log("Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#777" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE SECTION WITH EDITABLE PSEUDO */}
      <View style={styles.profileSection}>
        <TouchableOpacity
          onPress={openPseudoModal}
          style={styles.pseudoContainer}
        >
          <Text style={styles.profileTitle}>{pseudo}</Text>
          <Ionicons
            name="pencil"
            size={16}
            color="#4CAF50"
            style={styles.editIcon}
          />
        </TouchableOpacity>

        {/* Avatar avec bouton Vestiaire */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={openAvatarModal}
            style={styles.avatarWrapper}
          >
            <DynamicAvatar avatarType={avatar.type} size={180} />
            <View style={styles.editAvatarBadge}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wardrobeButton}
            onPress={() => navigation.navigate("Vestiaire")}
          >
            <Ionicons name="shirt-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* BOOKS SECTION - Taille réduite */}
      <View style={styles.booksSection}>
        <View style={styles.booksSectionHeader}>
          <Text style={styles.sectionTitle}>Mes livres préférés</Text>
          <TouchableOpacity
            style={styles.modifyButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.modifyButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des livres favoris avec hauteur fixe */}
        <View style={styles.booksListContainer}>
          {favoriteBooks.map((item) => (
            <View key={item.id} style={styles.bookItem}>
              {renderBookCover(item)}
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.author} numberOfLines={1}>
                  de {item.author}
                </Text>
              </View>
            </View>
          ))}
          {favoriteBooks.length === 0 && (
            <Text style={styles.emptyText}>
              Aucun livre favori sélectionné.
            </Text>
          )}
        </View>
      </View>

      {/* PROGRESS BAR AND UNLOCKABLE ITEMS - Position absolue en bas */}
      <View style={styles.progressSection}>
        <View style={styles.progressContainer}>
          <Ionicons
            name="heart"
            size={24}
            color="red"
            style={styles.heartIcon}
          />
          <ProgressBar />
        </View>
        <Text style={styles.unlockableTitle}>
          Vos prochains items à débloquer :
        </Text>
        <UnlockableItems />
      </View>

      {/* Modal pour modifier le pseudo */}
      <PseudoModal
        visible={pseudoModalVisible}
        currentPseudo={pseudo}
        onSave={savePseudo}
        onClose={() => setPseudoModalVisible(false)}
      />

      {/* Modal pour sélectionner l'avatar */}
      <AvatarSelectionModal
        visible={avatarModalVisible}
        currentAvatarType={avatar.type}
        onSave={saveAvatar}
        onClose={() => setAvatarModalVisible(false)}
      />

      {/* Modal pour sélectionner les livres favoris */}
      <BookSelectionModal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.sectionTitle}>
            Ajouter un livre à mes favoris
          </Text>

          <FlatList
            data={allBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bookItem}
                onPress={() => toggleFavorite(item)}
              >
                {renderBookCover(item)}
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
      </BookSelectionModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    position: "relative", // Pour positionner les éléments absolus
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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
    alignItems: "center",
    marginBottom: 20,
  },
  pseudoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  editIcon: {
    marginLeft: 8,
  },
  avatarContainer: {
    marginTop: 16,
    alignItems: "center",
    position: "relative",
    marginBottom: 30, // Augmenté pour laisser de l'espace pour l'avatar plus grand
  },
  avatarWrapper: {
    position: "relative",
  },
  editAvatarBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  wardrobeButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
  },
  avatarSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  avatarOption: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "transparent",
  },
  selectedAvatarOption: {
    borderColor: "#2D5A5A",
    backgroundColor: "rgba(45, 90, 90, 0.1)",
  },
  avatarSelectionImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  avatarSelectionText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  booksSection: {
    marginBottom: 20,
  },
  booksSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modifyButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
  },
  modifyButtonText: {
    color: "white",
    fontSize: 16,
  },
  booksListContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bookItem: {
    width: "30%",
    marginRight: "5%",
    marginBottom: 10,
    alignItems: "center",
  },
  bookCover: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 8,
  },
  bookInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  author: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  progressSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  heartIcon: {
    marginRight: 10,
  },
  unlockableTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalView: {
    marginTop: 30,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
  },
  buttonCancel: {
    backgroundColor: "#ccc",
  },
  buttonSave: {
    backgroundColor: "#4CAF50",
  },
  textStyle: {
    color: "white",
    textAlign: "center",
  },
});

export default ProfileScreen;
