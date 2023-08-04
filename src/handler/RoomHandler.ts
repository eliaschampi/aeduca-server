import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";
import { io } from "../con/SocketConection";
import { ROOM_ADD_PERSON } from "../config/const";
import { deleteRoomFolder } from "../core/FileCore";
import { decorateRooms } from "../decorators/RoomDecorator";
import { INewMessage, NewMessage } from "../model/Message";
import { personSingle } from "../model/Person";
import { INewRoom, IRoomDecoratored, NewRoom } from "../model/Room";
import { clientHasConection, updateCurrentRoom } from "../services/ConectedService";
import { destroyByRoom, newMessage } from "../services/MessageService";
import {
  byCpa,
  byPerson,
  destroyRoom,
  newRoom,
  togglePerson,
  updateCpa
} from "../services/RoomService";

export const fetchByPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni } = req.params;
    const values = decorateRooms(<IRoomDecoratored[]>await byPerson(dni), dni);
    return res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = NewRoom(req.body);
    room.is_group = true;
    const value = await newRoom(room);
    return res.status(200).send({ message: "Grupo creado", value });
  } catch (error) {
    next(error);
  }
};

export const createNewRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messageReq: INewMessage = req.body.message;
    const socketId: string = req.body.socketId;

    const friend: personSingle = req.body.friend;
    const from: personSingle = messageReq.from;

    const roomReq: INewRoom = {
      persons: [from, friend],
      is_group: false
    };

    const { insertedId } = await newRoom(NewRoom(roomReq));

    if (!insertedId) return res.status(500).send({ message: "Ourrio un error" });

    messageReq.room = `${insertedId}`;

    const message = NewMessage(messageReq);

    const { insertedId: message_id } = await newMessage(message);

    const { modifiedCount } = await updateCurrentRoom(socketId, messageReq.room);

    if (modifiedCount === 0) return res.status(500).send({ message: "Ourrio un error" });

    message._id = message_id;

    const socket = <Socket>io.of("/").sockets.get(socketId);

    socket.join(`room_${messageReq.room}`);

    const hasConection = await clientHasConection(friend.dni);

    if (hasConection) {
      socket.broadcast.emit("message:new", friend.dni);
    } else {
      // notificate
    }

    return res.status(200).send({ message, hasConection });
  } catch (error) {
    next(error);
  }
};

export const toggleCpa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.params;
    await updateCpa(_id, req.body.cpa_enabled);
    return res.status(200).send({ message: "Correctamente modificado" });
  } catch (error) {
    next(error);
  }
};

export const findByCpa = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cpa } = req.params;
    const value = await byCpa(cpa);
    return res.status(200).send({ value });
  } catch (error) {
    next(error);
  }
};

export const togglemember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id, person, mode, socketId } = req.body;

    const { modifiedCount, ohh } = await togglePerson(_id, mode, person);

    if (socketId && modifiedCount > 0) {
      const message = NewMessage({
        room: _id,
        content_type: "k",
        message: `${person.full_name} ${ohh}`,
        from: person,
        is_readed: false
      });

      const { insertedId } = await newMessage(message);

      const socket = io.of("/").sockets.get(socketId);

      if (socket && insertedId) {
        message._id = insertedId;
        const room_name = `room_${_id}`;

        socket.to(room_name).emit("message", message);

        if (ROOM_ADD_PERSON === mode) {
          socket.join(room_name);
        } else {
          updateCurrentRoom(socketId);
          socket.leave(room_name);
        }
      }
    }

    return res.status(200).send({ message: "Ok" });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id, socketId } = req.params;

    await Promise.all([deleteRoomFolder(_id), destroyByRoom(_id), destroyRoom(_id)]);

    const socket = io.of("/").sockets.get(socketId);

    if (socket) {
      socket.to(`room_${_id}`).emit("room:deleted", _id);
      socket.leave(`room_${_id}`);
    }

    return res.status(200).send({ message: "Correctamente eliminado" });
  } catch (error) {
    next(error);
  }
};
