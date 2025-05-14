import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Dimensions, Animated } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";

// Dimensions de l'écran
const { width, height } = Dimensions.get("window");

// Props de l'écran
type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Splash">;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Valeurs d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'apparition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Naviguer vers l'écran d'accueil après un délai
    const timer = setTimeout(() => {
      navigation.replace("Home");
    }, 3500); // 3.5 secondes

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/Logo-Fabulari-bleu3.svg")}
            style={styles.logo}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D5A5A", // Bleu-vert foncé
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: width * 0.8,
    height: height * 0.3,
    resizeMode: "contain",
    // Appliquer un filtre pour rendre le logo blanc pour qu'il contraste avec le fond
    tintColor: "#FFFFFF",
  },
});

export default SplashScreen;
