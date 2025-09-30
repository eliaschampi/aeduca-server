import { NextFunction, Request, Response } from "express";
import * as ls from "../services/LessonService";

export const fetchByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, graph } = req.params;
    if (!code || !graph) {
      res.status(400).json({ message: "codigo y graph son obligatorios" });
      return;
    }
    const value = await ls.fetchByCode(+code, graph);
    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const fetchByOp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { op_code, user } = req.params;
    if (!op_code || !user) {
      res.status(400).json({ message: "op_code y user son obligatorios" });
      return;
    }
    const values = await ls.fetchByOp(+op_code, user as "docente" | "estudiante");
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "codigo no proporcionado" });
      return;
    }
    await ls.update(req.body, +code);
    res.status(200).json({ message: "Correctamente actualizado" });
  } catch (error) {
    next(error);
  }
};

export const store = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ls.store(req.body);
    res.status(200).json({ message: "Correctamente guardado" });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "codigo no proporcionado" });
      return;
    }
    await ls.destroy(+code);
    res.status(200).json({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
