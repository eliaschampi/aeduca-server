import { Request, Response, NextFunction } from "express";
import * as act from "../services/ActivityService";

export const fetchBySection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_code, register_code } = req.params;
    const values = await act.fetchBySection(section_code, register_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};
