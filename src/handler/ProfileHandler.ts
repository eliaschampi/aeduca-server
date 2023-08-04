import { NextFunction, Request, Response } from "express";
import { findById, updateProfile } from "../services/ProfileService";
import bcrypt from "bcryptjs";
import { UploadedFile } from "express-fileupload";
import path from "path";

export const updateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dni, description } = req.body;
    await updateProfile(dni, { description });
    return res.status(200).json({ message: "Correctamente Actualizado" });
  } catch (error) {
    next(error);
  }
};

export const updateImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files) {
      return res.status(500).send({ message: "Ocurrio un error" });
    }
    const file = req.files.file as UploadedFile;
    const profile: any = await findById(req.params.dni);
    const PROFILE_PATH: string = <string>process.env.PROFILE;

    if (file.mimetype.indexOf("jpeg") === -1) {
      return res.status(500).send({ message: "Su foto tiene formato desconocido" });
    }

    if (file.size >= 30000) {
      return res.status(500).send({ message: "Su foto tiene excede el peso" });
    }

    /* if (profile.image.indexOf("default") === -1) {
      if (fs.existsSync(path.join(PROFILE_PATH, profile.image))) {
        fs.unlinkSync(path.join(PROFILE_PATH, profile.image));
      } else {
        throw new Error("Archivo anterior no encontrado");
      }
    } */
    const ramdom = Math.floor(Math.random() * 999) + 100;
    const imagename = `profile_${profile.person_dni}_${ramdom}.jpeg`;

    file.mv(path.join(PROFILE_PATH, imagename), async (err) => {
      if (err) {
        throw new Error(err.message);
      }

      await updateProfile(req.params.dni, { image: imagename });

      res.status(200).json({ message: "Su foto se subió con éxito", imagename });
    });
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
      return res.status(401).send({
        message: "Su contraseña actual es incorrecta"
      });
    }
    await updateProfile(dni, { password: bcrypt.hashSync(newpass) });

    return res.status(200).json({ message: "Correctamente Actualizado" });
  } catch (error) {
    next(error);
  }
};
