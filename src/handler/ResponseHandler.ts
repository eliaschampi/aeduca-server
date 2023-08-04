import { NextFunction, Request, Response } from "express";
import * as rh from "../services/ResponseService";

export const countRegsByLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = await rh.countRegsByLesson(req.params.sc);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchRegisterByLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lesson_code = parseInt(req.params.lesson_code);
    const skip = parseInt(req.params.skip);
    const values = await rh.regsByLesson(lesson_code, req.params.sc, skip);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = await rh.fetchByRegister(
      +req.params.lesson_code,
      req.params.register_code
    );
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const sendActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rh.sendActivity(req.body);
    return res.status(200).send({ message: "Correctamente enviado" });
  } catch (error) {
    next(error);
  }
};

export const toggleReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rh.toggleReceived(+req.params.lesson_code, req.params.register_code);
    return res.status(200).send({ message: "Una actividad ha sido revisado" });
  } catch (error) {
    next(error);
  }
};
