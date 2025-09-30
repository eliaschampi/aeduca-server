import { NextFunction, Request, Response } from "express";
import * as service from "../services/RegisterService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    if (!section_code) {
      res.status(400).json({ message: "Código de sección es requerido" });
      return;
    }
    const registers = await service.fetchBySection(section_code);
    const values = registers.map((item) => ({
      ...item,
      profile: item.profile || {},
      online: false
    }));
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const countBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code } = req.params;
    if (!section_code) {
      res.status(400).json({ message: "Código de sección es requerido" });
      return;
    }
    const value = await service.countBySection(section_code);
    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};
