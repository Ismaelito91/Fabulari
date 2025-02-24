import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models";
import { Model } from "sequelize";
import type { RequestHandler } from "express";

interface UserInstance extends Model {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  createAvatar: (data: any) => Promise<any>;
}

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = (await User.create({
      username,
      email,
      password: hashedPassword,
    })) as UserInstance;

    await user.createAvatar({
      hair: "default",
      face: "default",
      eyes: "default",
      outfit: "default",
      currentX: 0,
      currentY: 0,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};
