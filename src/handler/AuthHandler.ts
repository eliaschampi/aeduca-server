import { NextFunction, Request, Response } from "express";
import { fetchByDNI, fetchByUniqueAttrs } from "../services/PersonService";
import { fetchActiveRegister } from "../services/RegisterService";
import { fetchActiveTeacher } from "../services/TeacherService";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import MailConection from "../con/MailConection";
import { updateProfile } from "../services/ProfileService";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, password: reqPassword } = req.body;
    let register = null;
    let mode = "docente";

    if (!dni || !reqPassword) {
      res.status(404).json({ message: "Oh, campos ingresados son incorrectos" });
      return;
    }

    const person: any = await fetchByDNI(dni);
    console.log(person);
    if (!person?.profile) {
      res.status(404).json({ message: "Oh, no te encontramos en nuestro registro" });
      return;
    }

    const teacher: any = await fetchActiveTeacher(dni);
    if (!teacher) {
      register = await fetchActiveRegister(dni);
      if (!register) {
        res.status(404).json({
          message: `Aeduca espera tu matrícula ${new Date().getFullYear()}`
        });
        return;
      }
      mode = "estudiante";
    } else {
      person["spe"] = teacher.specialty;
      person["branch_code"] = teacher.branch_code;
    }

    const { password } = person.profile;
    const passwordIsValid = bcrypt.compareSync(reqPassword, password);

    if (!passwordIsValid) {
      res.status(401).json({
        message: "Tu contraseña es incorrecta"
      });
      return;
    }

    const secret = <Secret>process.env.JWT_KEY;
    const token = jwt.sign({ dni }, secret, {
      expiresIn: parseInt(<string>process.env.JWTTTL)
    });

    res.status(200).json({
      ...person,
      mode,
      register,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const recoverPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, dni } = req.body;

    const person = await fetchByUniqueAttrs(email, dni);

    if (!person) {
      res
        .status(500)
        .json({ message: "Tu correo o dni no coincide con nuestro registro" });
      return;
    }

    const newCode = `MT22${Math.floor(Math.random() * 9999) + 1000}`;
    const mailService = new MailConection();

    mailService.sendRecoverPassword(newCode, req.body.email, async (err: any) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ message: "Oh! ocurrió un error no esperado, intenta mas tarde" });
        return;
      }
      await updateProfile(dni, { password: bcrypt.hashSync(newCode) });
      res.status(200).json({
        message:
          "Querido usuario. Revisa tu correo, te hemos enviado un mensaje con tu nueva clave."
      });
    });
  } catch (error) {
    next(error);
  }
};
