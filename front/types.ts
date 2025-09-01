export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Avatar {
  id: number;
  userId: number;
  hair: string;
  face: string;
  eyes: string;
  outfit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  creatorId: number;
  creator?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: number;
  content: string;
  userId: number;
  roomId: number;
  isEdited: boolean;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}
