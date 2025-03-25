import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Avatar: React.FC = () => {
  return (
    <View style={styles.avatarContainer}>
      <Image source={require('../assets/Fichier 10.png')} style={styles.avatar} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 }
});

export default Avatar;
