import { NextFunction, Request, Response } from "express";
import { io } from "../con/SocketConection";
import { INewComment, NewComment } from "../model/Comment";
import { fetch, remove, store, update } from "../services/CommentService";

export const fetchComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const values = await fetch(req.params.post_id);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentReq: INewComment = {
      message: req.body.message,
      from: req.body.from,
      post: req.body.post_id,
      content_type: "t"
    };

    const socketId = req.body.socketId;

    const comment = NewComment(commentReq);
    const { insertedId } = await store(comment);
    // socket
    if (insertedId && socketId) {
      comment._id = insertedId;
      io.emit("comment:create", comment);
    }

    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { modifiedCount } = await update(req.params._id, req.body.message);
    const socketId = req.body.socketId;
    if (modifiedCount && socketId) {
      io.emit("comment:update", req.body);
    }
    return res.status(200).send({ message: "comentario actualizado" });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deletedCount } = await remove(req.params._id);
    const socketId = req.params.socketId;
    if (deletedCount && socketId) {
      io.emit("comment:delete", req.params._id);
    }
    return res.status(200).send({ message: "comentario eliminado" });
  } catch (error) {
    next(error);
  }
};
