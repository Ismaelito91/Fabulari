import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type pour éviter les erreurs sur require
const settingsIcon: ImageSourcePropType = require('../../assets/Fichier 3.png');

const ProfileHeader: React.FC = () => {
  return (
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
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
});

export default ProfileHeader;
