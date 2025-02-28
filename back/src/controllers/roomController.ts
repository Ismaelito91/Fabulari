import type { RequestHandler } from "express";
import db from "../models";

export const getAllRooms: RequestHandler = async (req, res) => {
  try {
    const rooms = await db.Room.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "backgroundImage",
        "maxPlayers",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la récupération des rooms",
      error: error.message,
    });
  }
};

export const getRoomById: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await db.Room.findByPk(roomId, {
      include: [
        {
          model: db.Message,
          as: "messages",
          include: [
            {
              model: db.User,
              as: "user",
              attributes: ["id", "username"],
            },
          ],
          limit: 50,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!room) {
      res.status(404).json({ message: "Room non trouvée" });
      return;
    }

    res.json(room);
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la room",
      error: error.message,
    });
  }
};

export const createRoom: RequestHandler = async (req, res) => {
  try {
    const { name, description, backgroundImage, maxPlayers } = req.body;

    const newRoom = await db.Room.create({
      name,
      description,
      backgroundImage: backgroundImage || "default",
      maxPlayers: maxPlayers || 10,
    });

    res.status(201).json({
      message: "Room créée avec succès",
      data: newRoom,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la création de la room",
      error: error.message,
    });
  }
};
