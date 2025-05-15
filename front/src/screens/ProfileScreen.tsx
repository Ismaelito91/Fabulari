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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "../components/ProgressBar";
import UnlockableItems from "../components/UnlockableItems";
import { useNavigation } from "@react-navigation/native";
import DynamicAvatar from "../components/Avatar"; // Ajustez le chemin si nécessaire
import {
  logout,
  isUsernameTaken,
  addUsedUsername,
  clearAppCache,
  debugAuthentication,
  testBackendConnection,
  checkServerStatus,
} from "../utils/authUtils";

// Import correct de l'icône des paramètres
const settingsIcon = require("../assets/Fichier 3.png");

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

// Interface pour les données utilisateur
interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  [key: string]: any; // Pour les autres propriétés potentielles
}

// Données de test pour l'avatar
const initialAvatarData: AvatarData = {
  id: 1,
  userId: 1,
  hair: "style1",
  face: "style1",
  eyes: "blue",
  outfit: "casual",
  accessories: "glasses",
  currentX: 0,
  currentY: 0,
};

const allBooks: Book[] = [
  {
    id: "1",
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    cover: require("../assets/Fichier 28.png"),
  },
  {
    id: "2",
    title: "Le Pont Des Tempêtes",
    author: "Danielle L. Jensen",
    cover: require("../assets/Fichier 28.png"),
  },
  {
    id: "3",
    title: "Un palais d'épines et de roses",
    author: "Sarah J. Maas",
    cover: require("../assets/Fichier 28.png"),
  },
];

function ProfileScreen({ route }: { route: any }) {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(allBooks);
  const [modalVisible, setModalVisible] = useState(false);
  const [pseudoModalVisible, setPseudoModalVisible] = useState(false);
  const [pseudo, setPseudo] = useState("Chargement...");
  const [tempPseudo, setTempPseudo] = useState("");
  const [avatarData, setAvatarData] = useState<AvatarData>(initialAvatarData);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<any>();

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userDataString = await AsyncStorage.getItem("userData");

        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
          setPseudo(parsedUserData.name || "Lecteur");
          setTempPseudo(parsedUserData.name || "Lecteur");
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            // Indiquer que le processus est en cours
            setIsLoading(true);
            console.log("DÉMARRAGE DU PROCESSUS DE DÉCONNEXION");

            // Déconnexion directe (sans navigation)
            const success = await logout();
            console.log(
              "Résultat de la déconnexion:",
              success ? "Succès" : "Échec"
            );

            // Si réussi, revenir à l'écran d'accueil
            if (success) {
              console.log("Navigation vers Home");
              // Utiliser resetRoot au lieu de reset
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            } else {
              console.log("Échec de déconnexion, affichage de l'alerte");
              Alert.alert(
                "Erreur",
                "La déconnexion a échoué. Veuillez redémarrer l'application.",
                [{ text: "OK" }]
              );
            }
          } catch (error) {
            console.error("ERREUR CRITIQUE:", error);
            Alert.alert(
              "Erreur",
              "Une erreur s'est produite. Veuillez redémarrer l'application.",
              [{ text: "OK" }]
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
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
    setTempPseudo(pseudo);
    setPseudoModalVisible(true);
  };

  const savePseudo = async () => {
    if (!tempPseudo.trim()) {
      Alert.alert("Erreur", "Le pseudo ne peut pas être vide");
      return;
    }

    if (tempPseudo.trim().length < 3) {
      Alert.alert("Erreur", "Le pseudo doit contenir au moins 3 caractères");
      return;
    }

    // Si c'est le même pseudo, pas besoin de vérifier
    if (tempPseudo === pseudo) {
      setPseudoModalVisible(false);
      return;
    }

    // Vérifier si le pseudo est déjà utilisé
    const isUsed = await isUsernameTaken(tempPseudo);
    if (isUsed) {
      Alert.alert(
        "Erreur",
        "Ce pseudo est déjà utilisé par un autre utilisateur"
      );
      return;
    }

    try {
      // Sauvegarder le nouveau pseudo
      const oldPseudo = pseudo;
      setPseudo(tempPseudo);

      // Mettre à jour les données utilisateur
      if (userData) {
        const updatedUserData = {
          ...userData,
          name: tempPseudo,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);

        // Ajouter le nouveau pseudo à la liste
        await addUsedUsername(tempPseudo);

        // TODO: En production, mise à jour côté serveur
        console.log(`Pseudo modifié: ${oldPseudo} -> ${tempPseudo}`);

        setPseudoModalVisible(false);
      }
    } catch (error) {
      console.error("Erreur lors de la modification du pseudo:", error);
      Alert.alert(
        "Erreur",
        "Impossible de modifier le pseudo. Veuillez réessayer plus tard."
      );
    }
  };

  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
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
            style={[styles.iconButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.clearCacheButton]}
            onPress={() => {
              Alert.alert(
                "Effacer le cache",
                "Cela supprimera toutes les données temporaires et vous déconnectera. Continuer ?",
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Effacer",
                    style: "destructive",
                    onPress: async () => {
                      const success = await clearAppCache();
                      if (success) {
                        // Rediriger vers l'écran d'accueil après nettoyage
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Home" }],
                        });
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Nettoyer le cache</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.debugButton]}
            onPress={() => debugAuthentication()}
          >
            <Ionicons name="bug-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Déboguer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.testButton]}
            onPress={() => testBackendConnection()}
          >
            <Ionicons name="server-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Tester Backend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.serverStatusButton]}
            onPress={() => checkServerStatus()}
          >
            <Ionicons name="pulse-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>État Serveur</Text>
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

      {/* PROFILE SECTION WITH EDITABLE PSEUDO AND USER INFO */}
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

        {/* Informations de l'utilisateur */}
        {userData && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Email: {userData.email}</Text>
            {userData.createdAt && (
              <Text style={styles.userInfoText}>
                Membre depuis:{" "}
                {new Date(userData.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Avatar avec bouton Vestiaire */}
        <View style={styles.avatarContainer}>
          <DynamicAvatar />
          <TouchableOpacity
            style={styles.wardrobeButton}
            onPress={() => navigation.navigate("Vestiaire")}
          >
            <Ionicons name="shirt-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Section de gestion de compte */}
        <View style={styles.accountManagementSection}>
          <Text style={styles.sectionTitle}>Gestion du compte</Text>
          <View style={styles.accountButtonsContainer}>
            <TouchableOpacity
              style={styles.accountButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.accountButtonText}>Déconnexion</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.accountButton, styles.deleteAccountButton]}
              onPress={() => {
                Alert.alert(
                  "Supprimer le compte",
                  "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          setIsLoading(true);
                          console.log(
                            "DÉBUT DE LA SUPPRESSION DU COMPTE (SIMULÉE)"
                          );

                          // Pour le moment, nous utilisons simplement la déconnexion
                          // car le backend n'a pas encore de route pour supprimer le compte
                          const success = await logout();

                          if (success) {
                            console.log("COMPTE SUPPRIMÉ AVEC SUCCÈS (SIMULÉ)");

                            // Revenir directement à l'accueil
                            navigation.reset({
                              index: 0,
                              routes: [{ name: "Home" }],
                            });
                          } else {
                            console.log("ÉCHEC DE SUPPRESSION DE COMPTE");
                            Alert.alert(
                              "Erreur",
                              "Une erreur est survenue. Veuillez redémarrer l'application.",
                              [{ text: "OK" }]
                            );
                          }
                        } catch (error) {
                          console.error("ERREUR CRITIQUE:", error);
                          Alert.alert(
                            "Erreur",
                            "Une erreur grave est survenue. Veuillez redémarrer l'application.",
                            [{ text: "OK" }]
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.accountButtonText}>Supprimer le compte</Text>
            </TouchableOpacity>
          </View>
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
              <Image source={item.cover} style={styles.bookCover} />
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
    position: "relative", // Pour positionner les éléments absolus
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
  },
  wardrobeButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
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
  userInfoContainer: {
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#FF5252",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  accountManagementSection: {
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
  },
  accountButtonsContainer: {
    marginTop: 10,
    gap: 10,
  },
  accountButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 5,
  },
  accountButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  deleteAccountButton: {
    backgroundColor: "#FF5252",
  },
  clearCacheButton: {
    backgroundColor: "#e67e22",
    marginTop: 10,
  },
  debugButton: {
    backgroundColor: "#9b59b6",
    marginTop: 10,
  },
  testButton: {
    backgroundColor: "#3498db",
    marginTop: 10,
  },
  serverStatusButton: {
    backgroundColor: "#27ae60",
    marginTop: 10,
  },
});

export default ProfileScreen;
