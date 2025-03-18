import axios from "axios";
import { ENDPOINTS, API_CONFIG } from "../api";
import { Message } from "../types";

interface MessagesResponse {
  messages: Message[];
}

// Récupérer les messages d'une room
export const getRoomMessages = async (
  token: string,
  roomId: number | string
): Promise<MessagesResponse> => {
  try {
    const response = await axios.get(ENDPOINTS.ROOM_MESSAGES(roomId), {
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Erreur de récupération des messages" }
    );
  }
};

// Envoyer un message
export const sendMessage = async (
  token: string,
  roomId: number | string,
  content: string
): Promise<Message> => {
  try {
    const response = await axios.post(
      ENDPOINTS.ROOM_MESSAGES(roomId),
      { content },
      {
        headers: {
          ...API_CONFIG.headers,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Erreur d'envoi de message" };
  }
};
