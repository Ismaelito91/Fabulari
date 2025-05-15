import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserInfoProps {
  pseudo: string;
  onPseudoEdit: () => void;
  onWardrobePress: () => void;
}


const UserInfo = ({ pseudo, onPseudoEdit, onWardrobePress }: UserInfoProps) => {
  const useCustomAvatar = false; // Flag pour choisir entre Avatar custom ou image statique

  return (
    <View style={styles.profileSection}>
      {/* Pseudo avec bouton d'édition */}
      <TouchableOpacity onPress={onPseudoEdit} style={styles.pseudoContainer}>
        <Text style={styles.profileTitle}>{pseudo}</Text>
        <Ionicons name="pencil" size={16} color="#4CAF50" style={styles.editIcon} />
      </TouchableOpacity>
      
      {/* Avatar avec bouton Vestiaire */}
      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/Chibi garçon.png")}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.wardrobeButton} onPress={onWardrobePress}>
          <Ionicons name="shirt-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 8,
    alignItems: 'center',
    position: 'relative',
    width: 200,
    height: 240,

  },
  avatar: {
    width: 140,
    height: 240,
    position: 'absolute',
  },
  wardrobeButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 50,
  },
});

export default UserInfo;
