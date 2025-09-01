import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const words = ["Bonjour", "React Native", "Expo", "Développement", "Programmation"];

export default function SwipeListScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.word}>{words[currentIndex]}</Text>
      <View style={styles.buttonContainer}>
        <Button title="← Précédent" onPress={handlePrevious} disabled={currentIndex === 0} />
        <Button title="Suivant →" onPress={handleNext} disabled={currentIndex === words.length - 1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  word: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
});

