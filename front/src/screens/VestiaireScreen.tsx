import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type pour les catégories de vêtements
type CategoryType = 'pinceau' | 'lunettes' | 'chapeau' | 'tshirt' | 'pantalon' | 'robe';

// Type pour les articles vestimentaires
interface ClothingItem {
  id: number;
  name: string;
  image: any; // Pour React Native, on utilise require() pour les images
  category: CategoryType;
}

// Type pour les données de l'avatar
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

const getIconName = (category: CategoryType): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<CategoryType, keyof typeof Ionicons.glyphMap> = {
    pinceau: 'brush',
    lunettes: 'glasses',
    chapeau: 'school',
    tshirt: 'shirt',
    pantalon: 'walk',
    robe: 'woman',
  };
  return iconMap[category];
};

const VestiaireScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  // Récupérer l'avatar s'il est passé dans les paramètres de route
  const initialAvatarData = route.params?.avatarData || {
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

  // États
  const [rotation, setRotation] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('tshirt');
  const [avatarData, setAvatarData] = useState<AvatarData>(initialAvatarData);
  const [selectedOutfit, setSelectedOutfit] = useState<Record<CategoryType, number | null>>({
    pinceau: null,
    lunettes: null,
    chapeau: null,
    tshirt: null,
    pantalon: null,
    robe: null,
  });

  // Données de démonstration pour les vêtements
  const clothingItems: ClothingItem[] = [
    { id: 1, name: 'T-shirt blanc', image: null, category: 'tshirt' },
    { id: 2, name: 'T-shirt noir', image: null, category: 'tshirt' },
    { id: 3, name: 'Pantalon bleu', image: null, category: 'pantalon' },
    { id: 4, name: 'Robe rouge', image: null, category: 'robe' },
    { id: 5, name: 'Chapeau noir', image: null, category: 'chapeau' },
    { id: 6, name: 'Lunettes rondes', image: null, category: 'lunettes' },
  ];

  // Filtrer les vêtements par catégorie sélectionnée
  const filteredItems = clothingItems.filter(item => item.category === selectedCategory);

  // Fonction pour tourner l'avatar
  const rotateAvatar = (direction: 'left' | 'right') => {
    setRotation((prev) => direction === 'left' ? (prev - 90) % 360 : (prev + 90) % 360);
  };

  // Fonction pour sélectionner un vêtement
  const selectClothingItem = (item: ClothingItem) => {
    setSelectedOutfit(prev => ({
      ...prev,
      [item.category]: item.id,
    }));

    // Mettre à jour l'avatar pour le démontrer
    if (item.category === 'tshirt' || item.category === 'robe') {
      setAvatarData(prev => ({
        ...prev,
        outfit: item.name.toLowerCase().includes('blanc') ? 'casual' : 'formal'
      }));
    } else if (item.category === 'lunettes') {
      setAvatarData(prev => ({
        ...prev,
        accessories: 'glasses'
      }));
    } else if (item.category === 'chapeau') {
      setAvatarData(prev => ({
        ...prev,
        hair: item.name.toLowerCase().includes('noir') ? 'style2' : 'style1'
      }));
    }
  };

  // Fonction pour sauvegarder les modifications
  const saveChanges = () => {
    navigation.navigate('ProfileScreen', { updatedAvatarData: avatarData });
  };

  // Composant Avatar
  const DynamicAvatar = () => (
    <View style={[styles.avatarDisplay, { transform: [{ rotateY: `${rotation}deg` }] }]} >
      <View style={[styles.avatarPart, { backgroundColor: avatarData.hair === 'style1' ? '#8B4513' : '#000000' }]} >
        <Text style={styles.avatarPartText}>Cheveux</Text>
      </View>
      <View style={[styles.avatarPart, { backgroundColor: avatarData.face === 'style1' ? '#FFE4C4' : '#FFD700' }]} >
        <Text style={styles.avatarPartText}>Visage</Text>
      </View>
      <View style={[styles.avatarPart, { backgroundColor: avatarData.eyes === 'blue' ? '#1E90FF' : '#228B22' }]} >
        <Text style={styles.avatarPartText}>Yeux</Text>
      </View>
      <View style={[styles.avatarPart, { backgroundColor: avatarData.outfit === 'casual' ? '#FF6347' : '#8A2BE2' }]} >
        <Text style={styles.avatarPartText}>Tenue</Text>
      </View>
      {avatarData.accessories && (
        <View style={[styles.avatarPart, { backgroundColor: '#C0C0C0', position: 'absolute', top: 10, right: 10 }]} >
          <Text style={styles.avatarPartText}>Acc.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#777" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vestiaire</Text>
        <TouchableOpacity onPress={saveChanges} style={styles.saveButton}>
          <Ionicons name="save-outline" size={18} color="white" />
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={() => rotateAvatar('left')} style={styles.rotateButton}>
          <Ionicons name="arrow-back" size={24} color="#777" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <DynamicAvatar />
        </View>

        <TouchableOpacity onPress={() => rotateAvatar('right')} style={styles.rotateButton}>
          <Ionicons name="arrow-forward" size={24} color="#777" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['pinceau', 'lunettes', 'chapeau', 'tshirt', 'pantalon', 'robe'].map((category) => (
            <TouchableOpacity 
              key={category}
              onPress={() => setSelectedCategory(category as CategoryType)}
              style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
            >
              <Ionicons name={getIconName(category as CategoryType)} size={24} color={selectedCategory === category ? "#2196F3" : "#777"} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.itemsGrid}>
        <View style={styles.gridContainer}>
          {filteredItems.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => selectClothingItem(item)}
              style={[styles.clothingItem, selectedOutfit[item.category] === item.id && styles.selectedItem]}
            >
              <View style={styles.itemImageContainer}>
                <Ionicons 
                  name={getIconName(item.category)} 
                  size={32} 
                  color="#777" 
                />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: { padding: 10, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  avatarSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16 },
  avatarContainer: { marginHorizontal: 16 },
  rotateButton: { padding: 10 },
  avatarDisplay: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  avatarPart: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  avatarPartText: { color: 'white' },
  categoryNav: { marginTop: 16, paddingHorizontal: 10 },
  categoryButton: { padding: 10, marginHorizontal: 5 },
  selectedCategory: { backgroundColor: '#E3F2FD', borderRadius: 25 },
  itemsGrid: { marginTop: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  clothingItem: { width: 100, alignItems: 'center', marginBottom: 16 },
  selectedItem: { borderColor: '#2196F3', borderWidth: 2 },
  itemImageContainer: { marginBottom: 8 },
  itemName: { fontSize: 14, textAlign: 'center' },
});

export default VestiaireScreen;
