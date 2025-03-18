// Remplacez par votre URL ngrok actuelle
export const API_URL = "https://votre-url-ngrok.io";

// Configuration pour Axios
export const API_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
};

// Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  PROFILE: `${API_URL}/api/auth/profile`,

  // Rooms
  ROOMS: `${API_URL}/api/rooms`,
  PUBLIC_ROOMS: `${API_URL}/api/rooms/public`,

  // Chat
  ROOM_MESSAGES: (roomId: number | string) =>
    `${API_URL}/api/chat/rooms/${roomId}/messages`,
  MESSAGE: (messageId: number | string) =>
    `${API_URL}/api/chat/messages/${messageId}`,
};
