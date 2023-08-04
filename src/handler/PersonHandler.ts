import { NextFunction, Request, Response } from "express";
import { fetchPersonsByDNIS, finderQuery, updateEmail } from "../services/PersonService";

export const fetchLikers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dnis } = req.params;
    const values = await fetchPersonsByDNIS(dnis);
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const finder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.params;
    const values = await finderQuery(query);
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const changeEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, email } = req.body;
    await updateEmail(dni, email);
    return res.status(200).json({ message: "Correctamente modificado" });
  } catch (error) {
    next(error);
  }
};
