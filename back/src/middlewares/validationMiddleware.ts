import type { Request, Response, NextFunction } from "express";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, email, password } = req.body;

  // Validation du nom d'utilisateur
  if (!username || username.length < 3) {
    res.status(400).json({
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
    });
    return;
  }

  // Validation de l'email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      message: "Veuillez fournir une adresse email valide",
    });
    return;
  }

  // Validation du mot de passe
  if (!password || password.length < 8) {
    res.status(400).json({
      message: "Le mot de passe doit contenir au moins 8 caractères",
    });
    return;
  }

  next();
};
