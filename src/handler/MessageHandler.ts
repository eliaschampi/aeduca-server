import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { io } from "../con/SocketConection";
import { charResourcesPath, deleteSimple } from "../core/FileCore";
import { decorateMessages } from "../decorators/MessageDecorator";
import { NewMessage } from "../model/Message";
import { roomHasActives } from "../services/ConectedService";
import {
  byId,
  byRoom,
  destroyMessage,
  isDeleted,
  newMessage
} from "../services/MessageService";

export const fetchByRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { room, dni, skip, take } = req.params;
    const values = decorateMessages(await byRoom(room, dni, +skip, +take));
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const uploadAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files) {
      return res.status(500).send({ message: "Ocurrio un error" });
    }

    const file = req.files.file as UploadedFile;

    const messageReq = JSON.parse(req.body.message);

    const message = NewMessage(messageReq);

    file.mv(charResourcesPath(<string>message.room, file.name), async (err: any) => {
      if (err) {
        throw new Error(err.message);
      }
      roomHasActives(<string>message.room).then(async (hasActives) => {
        message.is_readed = hasActives;
        const { insertedId } = await newMessage(message);
        message._id = insertedId;
        const socket = io.of("/").sockets.get(req.body.socketId);
        if (socket) {
          socket.to(`room_${message.room}`).emit("message", message);
        }
        res.status(200).send({ value: message });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const downloadAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.download(charResourcesPath(req.params.room, req.params.url));
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id, dni, everybody } = req.params;

    const message: any = await byId(_id);

    if (everybody === "true") {
      if (message.url) {
        deleteSimple(charResourcesPath(<string>message.room), message.url);
      }

      await destroyMessage(_id);
      io.to(`room_${message.room}`).emit("message:deleted", _id, message.room);
    } else {
      await isDeleted(_id, dni);
    }

    return res.status(200).send({ message: "ok" });
  } catch (error) {
    next(error);
  }
};
