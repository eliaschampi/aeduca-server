import { Request, Response, NextFunction } from "express";
import * as act from "../services/ActivityService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code, register_code } = req.params;
    if (!section_code || !register_code) {
      res.status(400).json({ message: "Código de sección y registro son requeridos" });
      return;
    }
    const values = await act.fetchBySection(section_code, register_code);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};
