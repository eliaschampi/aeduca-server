import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import {
  entryTime,
  existsToday,
  fetchByEntity,
  justificate,
  sendPermise,
  store
} from "../services/AttendanceService";

export const fetchEntryData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cycle_code } = req.params;
    if (!cycle_code) {
      res.status(400).json({ message: "Código de ciclo es requerido" });
      return;
    }
    const values = await entryTime(cycle_code);

    let value = {};

    if (values.length !== 0) {
      const attendances = values[0].attendance;
      if (attendances.length === 1) {
        res.status(200).json({ value: attendances[0] });
        return;
      }
      value = attendances.find(
        (at: { order: number }) => at.order === (new Date().getHours() >= 12 ? 2 : 1)
      );
    }

    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

export const storeJustification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { a_code } = req.params;
    if (!a_code) {
      res.status(400).json({ message: "Código de asistencia es requerido" });
      return;
    }
    const { description } = req.body;
    const JUSTIFICATE_PATH: string = <string>process.env.JUSTIFICATE;
    if (req.files) {
      const file = req.files.file as UploadedFile;
      const ramdom = Math.floor(Math.random() * 999) + 100;
      const ext = file.mimetype.substr(file.mimetype.indexOf("/") + 1);
      const filename = `jus_${a_code}_${ramdom}.${ext}`;
      file.mv(path.join(JUSTIFICATE_PATH, filename), async (err) => {
        if (err) {
          throw new Error(err.message);
        }

        await justificate(+a_code, description, filename);
      });
    } else {
      await justificate(+a_code, description, null);
    }
    res.status(200).json({ message: "Tu justificación ha sido enviado" });
  } catch (error) {
    next(error);
  }
};

export const storeAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entity_identifier, entity_type } = req.body;
    const _existsToday = await existsToday(entity_identifier, entity_type);
    if (_existsToday) {
      res.status(200).json({
        message: "Su asistencia ya ha sido registrado",
        value: null
      });
      return;
    }
    const value = await store(req.body);
    res.status(200).json({ message: "Correctamente Guardado", value });
  } catch (error) {
    next(error);
  }
};

export const fetchAttendanceByEntity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { entity_identifier } = req.params;
    if (!entity_identifier) {
      res.status(400).json({ message: "Código de entidad es requerido" });
      return;
    }
    const { from, to, priority } = req.query;

    const attendances = await fetchByEntity(
      entity_identifier,
      from as string,
      to as string,
      Number(priority)
    );

    res.status(200).json({ values: attendances });
  } catch (error) {
    next(error);
  }
};

export const createInspection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await sendPermise(req.body);
    res.status(200).json({ message: "Correctamente enviado" });
  } catch (error) {
    next(error);
  }
};
