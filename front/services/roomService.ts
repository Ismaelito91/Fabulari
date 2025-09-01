import axios from "axios";
import { ENDPOINTS, API_CONFIG } from "../api";
import { Room } from "../types";

interface RoomData {
  name: string;
  description: string;
  isPrivate?: boolean;
}

// Récupérer toutes les rooms publiques
export const getPublicRooms = async (token: string): Promise<Room[]> => {
  try {
    const response = await axios.get(ENDPOINTS.PUBLIC_ROOMS, {
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Erreur de récupération des rooms" }
    );
  }
};

// Créer une nouvelle room
export const createRoom = async (
  token: string,
  roomData: RoomData
): Promise<Room> => {
  try {
    const response = await axios.post(ENDPOINTS.ROOMS, roomData, {
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Erreur de création de room" };
  }
};
