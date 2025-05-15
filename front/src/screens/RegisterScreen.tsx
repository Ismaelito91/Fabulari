import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { register, isUsernameTaken } from "../utils/authUtils";

type RegisterScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Register">;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  // Vérifier la disponibilité du pseudo
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    const isTaken = await isUsernameTaken(username);
    setUsernameAvailable(!isTaken);
    setIsCheckingUsername(false);
  };

  // Gérer le changement de pseudo avec vérification
  const handleNameChange = (text: string) => {
    setName(text);
    setErrorMessage(null);

    // Vérifier la disponibilité après une courte pause pour éviter des vérifications à chaque frappe
    if (text.length >= 3) {
      // Délai de vérification de 500ms après l'arrêt de la frappe
      const timeoutId = setTimeout(() => checkUsername(text), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleRegister = async () => {
    // Validation basique
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs");
      return;
    }

    if (name.length < 3) {
      setErrorMessage("Le pseudo doit contenir au moins 3 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Vérifier une dernière fois la disponibilité du pseudo
    const isTaken = await isUsernameTaken(name);
    if (isTaken) {
      setErrorMessage(
        "Ce pseudo est déjà utilisé. Veuillez en choisir un autre."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Début de l'inscription...");
      // Appel à la fonction d'inscription réelle
      const success = await register(name, email, password);
      console.log("Résultat de l'inscription:", success);

      if (success) {
        // Rediriger directement vers l'écran d'accueil au lieu de l'écran de connexion
        navigation.navigate("Home");
      } else {
        setErrorMessage("L'inscription a échoué. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setErrorMessage(
        "Une erreur s'est produite. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/Logo-Fabulari-bleu3.svg")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Créer un compte</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pseudo</Text>
            <View style={styles.usernameInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  usernameAvailable === true ? styles.inputAvailable : null,
                  usernameAvailable === false ? styles.inputUnavailable : null,
                ]}
                placeholder="Choisissez un pseudo unique"
                value={name}
                onChangeText={handleNameChange}
                autoCorrect={false}
                editable={!isLoading}
              />
              {isCheckingUsername && (
                <ActivityIndicator size="small" style={styles.inputIcon} />
              )}
              {!isCheckingUsername && usernameAvailable === true && (
                <Text style={[styles.inputIcon, styles.availableText]}>✓</Text>
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <Text style={[styles.inputIcon, styles.unavailableText]}>
                  ✗
                </Text>
              )}
            </View>
            {name.length > 0 && name.length < 3 && (
              <Text style={styles.helperText}>
                Le pseudo doit contenir au moins 3 caractères
              </Text>
            )}
            {usernameAvailable === false && (
              <Text style={styles.helperText}>Ce pseudo est déjà utilisé</Text>
            )}
            {usernameAvailable === true && (
              <Text style={[styles.helperText, styles.availableText]}>
                Pseudo disponible
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe (min. 6 caractères)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(null);
              }}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMessage(null);
              }}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isLoading && styles.buttonDisabled,
              usernameAvailable === false && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading || usernameAvailable === false}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D5A5A",
    marginBottom: 20,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 15,
  },
  usernameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    right: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    flex: 1,
  },
  inputAvailable: {
    borderColor: "#4CAF50",
  },
  inputUnavailable: {
    borderColor: "#FF6B6B",
  },
  availableText: {
    color: "#4CAF50",
  },
  unavailableText: {
    color: "#FF6B6B",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    color: "#666",
  },
  button: {
    backgroundColor: "#2D5A5A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666666",
    fontSize: 14,
  },
  loginLink: {
    color: "#2D5A5A",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5,
  },
});

export default RegisterScreen;
