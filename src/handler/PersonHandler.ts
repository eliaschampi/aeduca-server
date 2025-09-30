import { NextFunction, Request, Response } from "express";
import { fetchPersonsByDNIS, finderQuery, updateEmail } from "../services/PersonService";

export const fetchLikers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dnis } = req.params;
    if (!dnis) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    const values = await fetchPersonsByDNIS(dnis);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const finder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.params;
    if (!query) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    const values = await finderQuery(query);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const changeEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, email } = req.body;
    if (!dni || !email) {
      res.status(400).json({ message: "Parámetros inválidos" });
      return;
    }
    await updateEmail(dni, email);
    res.status(200).json({ message: "Correctamente modificado" });
  } catch (error) {
    next(error);
  }
};
