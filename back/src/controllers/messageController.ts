import type { RequestHandler } from "express";
import db from "../models";

export const getMessagesByRoom: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await db.Message.findAll({
      where: { roomId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la récupération des messages",
      error: error.message,
    });
  }
};

export const getMessagesByUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await db.Message.findAll({
      where: { userId },
      include: [
        {
          model: db.Room,
          as: "room",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la récupération des messages",
      error: error.message,
    });
  }
};

export const createMessage: RequestHandler = async (req, res) => {
  try {
    const { content, roomId } = req.body;

    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const userId = (req as any).userId || 1; // Fallback à l'utilisateur 1 pour les tests

    const newMessage = await db.Message.create({
      content,
      userId,
      roomId,
    });

    res.status(201).json({
      message: "Message créé avec succès",
      data: newMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la création du message",
      error: error.message,
    });
  }
};
