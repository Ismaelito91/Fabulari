import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const items: any[] = [
  require('../assets/Fichier 9.png'),
  require('../assets/Fichier 7.png'),
  require('../assets/Fichier 6.png')
];

const UnlockableItems: React.FC = () => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Image key={index} source={item} style={styles.item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: 10 },
  item: { width: 40, height: 40, marginHorizontal: 5 }
});

export default UnlockableItems;
