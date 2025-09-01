const axios = require("axios");

// Remplacez par l'URL de votre serveur
const API_URL = "http://localhost:3001";

async function testAPI() {
  try {
    console.log("Test de connexion au serveur...");
    const response = await axios.get(`${API_URL}/`);
    console.log("Réponse du serveur:", response.data);
    console.log("✅ Connexion réussie!");
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
  }
}

testAPI();
