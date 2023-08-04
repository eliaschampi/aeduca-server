import { NextFunction, Request, Response } from "express";
import MailConection from "../con/MailConection";
import {
  branchByStudent,
  coursesBySpe,
  fetchSupport,
  saveSupport
} from "../services/MainService";
import { fetchByEmail } from "../services/PersonService";

export const sendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newCode = Math.floor(Math.random() * 99999) + 10000;
    const mailService = new MailConection();

    const value = await fetchByEmail(req.body.email);

    if (value) {
      return res
        .status(422)
        .send({ message: "El correo ingresado ya esta siendo usado" });
    }

    mailService.sendVerificationCode(String(newCode), req.body.email, (err: any) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ message: "Oh! ocurrió un error no esperado, intenta mas tarde" });
      }
      return res.status(200).send({
        code: newCode,
        message: "Te hemos enviado un código de verificación, revisa tu correo"
      });
    });
  } catch (error) {
    next(error);
  }
};

export const fetchSupportByFromAndType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, type } = req.params;
    const value = await fetchSupport(from, type);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const storeSupport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await saveSupport(req.body);
    return res.status(200).json({ message: "Correctamente enviado" });
  } catch (error) {
    next(error);
  }
};

export const fetchCoursesBySpe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const values = (await coursesBySpe()).map((c) => c.name.trim());
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni } = req.params;
    const value: any = await branchByStudent(dni);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};
