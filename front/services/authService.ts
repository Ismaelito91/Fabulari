import axios from "axios";
import { ENDPOINTS, API_CONFIG } from "../api";
import { LoginResponse, RegisterResponse, User } from "../types";

// Authentification
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      ENDPOINTS.LOGIN,
      { email, password },
      API_CONFIG
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Erreur de connexion" };
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(
      ENDPOINTS.REGISTER,
      { username, email, password },
      API_CONFIG
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Erreur d'inscription" };
  }
};

export const getProfile = async (token: string): Promise<User> => {
  try {
    const response = await axios.get<User>(ENDPOINTS.PROFILE, {
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Erreur de récupération du profil" }
    );
  }
};
