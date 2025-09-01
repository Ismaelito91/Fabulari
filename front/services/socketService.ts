import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { API_URL } from "../api";
import { Message } from "../types";

interface MessageData {
  roomId: number | string;
  content: string;
  user: {
    username: string;
  };
}

let socket: typeof Socket | null = null;

export const initializeSocket = (): typeof Socket => {
  socket = io(API_URL);

  socket.on("connect", () => {
    console.log("Connecté au serveur Socket.IO");
  });

  socket.on("disconnect", () => {
    console.log("Déconnecté du serveur Socket.IO");
  });

  return socket;
};

export const joinRoom = (roomId: number | string): void => {
  if (socket) {
    socket.emit("join_room", roomId);
    console.log(`Rejoint la room ${roomId}`);
  }
};

export const sendSocketMessage = (messageData: MessageData): void => {
  if (socket) {
    socket.emit("send_message", messageData);
  }
};

export const subscribeToMessages = (
  callback: (data: Message) => void
): void => {
  if (socket) {
    socket.on("receive_message", (data: Message) => {
      callback(data);
    });
  }
};

export const getSocket = (): typeof Socket | null => socket;
