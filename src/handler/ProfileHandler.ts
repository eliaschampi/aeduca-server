import { NextFunction, Request, Response } from "express";
import { findById, updateProfile } from "../services/ProfileService";
import bcrypt from "bcryptjs";

export const updateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dni, description } = req.body;
    await updateProfile(dni, { description });
    res.status(200).json({ message: "Correctamente Actualizado" });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, password, newpass } = req.body;
    const profile: any = await findById(dni);
    const passwordIsValid = bcrypt.compareSync(password, profile.password);
    if (!passwordIsValid) {
      res.status(401).json({
        message: "Su contraseña actual es incorrecta"
      });
      return;
    }
    await updateProfile(dni, { password: bcrypt.hashSync(newpass) });

    res.status(200).json({ message: "Correctamente Actualizado" });
  } catch (error) {
    next(error);
  }
};
