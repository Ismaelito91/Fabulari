import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../ProgressBar';
import UnlockableItems from '../UnlockableItems';

const ProgressSection: React.FC = () => {
  return (
    <View style={styles.progressSection}>
      <View style={styles.progressContainer}>
        <Ionicons name="heart" size={24} color="red" style={styles.heartIcon} />
        <ProgressBar />
      </View>
      <Text style={styles.unlockableTitle}>Vos prochains items à débloquer :</Text>
      <UnlockableItems />
    </View>
  );
};

const styles = StyleSheet.create({
  progressSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
});

export default ProgressSection;
