import { NextFunction, Request, Response } from "express";
import { IScore } from "../model/Score";
import * as c from "../services/ScoreService";
import { update } from "../services/CalificationService";
import { fetchByIn } from "../services/RegisterService";

export const createOrUpdateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = await c.updateOrCreate(req.body);
    return res.status(200).send({ message: "Correctamente actualizado", value });
  } catch (error) {
    next(error);
  }
};

export const calificateBySdf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keys, lesson_code } = req.body;
    const countQuestion: number = keys.length;
    const sdf: { code: string; keys: string }[] = req.body.sdf;

    if (/^[A-F]{5,80}$/.test(keys) === false || sdf.length < 5) {
      throw new Error("Recursos proporcionados no son suficientes");
    }
    const accepteds: any[] = await fetchByIn(
      sdf.map((s) => s.code),
      req.body.sections
    );
    let cItems: IScore[] = [];
    sdf.forEach((item) => {
      let cheks = 0;
      if (accepteds.some((a) => a.code === item.code)) {
        for (let i = 0; i < countQuestion; i++) {
          if (keys[i] === item.keys[i]) cheks++;
        }
        cItems = [
          ...cItems,
          {
            lesson_code,
            register_code: item.code,
            lesson_type: "calification",
            score: ((20 * cheks) / countQuestion).toFixed(2),
            keys: item.keys
          }
        ];
      }
    });
    if (cItems.length > 0) {
      await c.updateOrCreate(cItems);
      await update(lesson_code, { uploaded_at: new Date().toJSON() });
    }
    return res
      .status(200)
      .send({ message: `Se calificaron ${cItems.length} estudiantes` });
  } catch (error) {
    next(error);
  }
};

export const removeAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await update(+req.params.lesson_code, { uploaded_at: null });
    await c.removeAll(+req.params.lesson_code);
    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
