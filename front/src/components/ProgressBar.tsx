import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ProgressBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Fichier 4.png')} style={styles.icon} />
      <View style={styles.bar}>
        <View style={[styles.progress, { width: '60%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  icon: { width: 30, height: 30, marginRight: 10 },
  bar: { width: 150, height: 10, backgroundColor: '#ddd', borderRadius: 5 },
  progress: { height: 10, backgroundColor: '#ff5252', borderRadius: 5 }
});

export default ProgressBar;
