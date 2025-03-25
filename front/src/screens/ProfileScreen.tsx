import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icônes pour les boutons
import Avatar from '../components/Avatar';
import ProgressBar from '../components/ProgressBar';
import UnlockableItems from '../components/UnlockableItems';

// Import correct de l'icône des paramètres
const settingsIcon = require('../assets/Fichier 3.png');

// Définition du type pour les livres
interface Book {
  id: string;
  title: string;
  author: string;
  cover: any;
}

const favoriteBooks: Book[] = [
  { id: '1', title: 'Fourth Wing', author: 'Rebecca Yarros', cover: require('../assets/Fichier 28.png') },
  { id: '2', title: 'Le Pont Des Tempêtes', author: 'Danielle L. Jensen', cover: require('../assets/Fichier 28.png') },
  { id: '3', title: 'Un palais d’épines et de roses', author: 'Sarah J. Maas', cover: require('../assets/Fichier 28.png') }
];

const ProfileScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>

        {/* Barre du haut avec les 3 boutons */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon profil</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Action 1')}>
              <Image source={settingsIcon} style={styles.iconImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Action 2')}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Action 3')}>
              <Ionicons name="ellipsis-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <Avatar />

        <Text style={styles.sectionTitle}>Mes livres préférés</Text>
        
        {/* Bouton pour ajouter/modifier un livre */}
        <TouchableOpacity style={styles.addButton} onPress={() => console.log('Ajouter/Modifier livre')}>
          <Text style={styles.addButtonText}>Ajouter / Modifier un livre</Text>
        </TouchableOpacity>

        <FlatList
          data={favoriteBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <Image source={item.cover} style={styles.bookCover} />
              <View>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.author}>de {item.author}</Text>
              </View>
            </View>
          )}
          scrollEnabled={false} // Désactiver le scroll pour éviter un conflit avec ScrollView
        />

        {/* Section centrée pour ProgressBar et UnlockableItems */}
        <View style={styles.middleContainer}>
          <ProgressBar />
          <Text style={styles.sectionTitle}>Objets débloqués</Text>
          <UnlockableItems />
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 12,
  },
  iconImage: {
    width: 24,  // Ajuste la taille selon ton besoin
    height: 24,
    resizeMode: 'contain', // Garde les proportions
  },
  bookItem: { 
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
  },
  bookCover: { 
    width: 60,
    height: 90,
    marginRight: 16,
  },
  bookTitle: { 
    fontSize: 16,
    fontWeight: "bold",
  },
  author: { 
    fontSize: 14,
    color: "gray",
  },
  sectionTitle: { 
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  middleContainer: {
    justifyContent: "center", 
    alignItems: "center",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#6200ea",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title:{
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
