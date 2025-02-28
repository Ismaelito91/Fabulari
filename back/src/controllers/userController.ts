import type { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import db from "../models";
import type { UserModel } from "../models";
import type { RequestHandler } from "express";
import { Model } from "sequelize";

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

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = (await db.User.create({
      username,
      email,
      password: hashedPassword,
    })) as UserModel;

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
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = (await db.User.findOne({ where: { email } })) as UserInstance;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );
    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion", error });
  }
};

export const getProfile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Token manquant" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
    };
    const user = await db.User.findByPk(decoded.userId);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};
