import { NextFunction, Request, Response } from "express";
import { io } from "../con/SocketConection";
import { decoratePosts } from "../decorators/PostDecorator";
import { IPostDecorated, NewPost } from "../model/Post";
import {
  deletePost,
  fetchPosts,
  mainCount,
  newPost,
  toggleFixed,
  toggleSaved,
  update
} from "../services/PostService";

export const fetchMain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, skip, take, uid } = req.params;
    const values = decoratePosts(
      <IPostDecorated[]>await fetchPosts(dni, +skip, +take, uid),
      dni
    );
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, uid } = req.params;
    const count = await mainCount(dni, uid);
    return res.status(200).send({ count });
  } catch (error) {
    next(error);
  }
};

export const createNewPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reqData: any = {
      content: req.body.content,
      link: req.body.link,
      share_w: req.body.share_w,
      commentable: req.body.commentable,
      aproved: req.body.aproved,
      creator: req.body.creator,
      files: req.body.files
    };

    const socketId = req.body.socketId;

    const post = NewPost(reqData);

    const { insertedId } = await newPost(post);
    post._id = insertedId;

    const ipostdecorated: IPostDecorated = {
      ...post,
      comment_count: 0
    };

    const decorated = decoratePosts([ipostdecorated], "");

    // socket
    if (insertedId && socketId && post.share_w.some((i) => i === "all")) {
      const socket = io.of("/").sockets.get(socketId);

      if (socket) {
        socket.broadcast.emit("post:create", decorated[0]);
      }
    }

    return res
      .status(200)
      .send({ message: "Correctamente guardado", value: decorated[0] });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { modifiedCount } = await update(
      req.params._id,
      req.body.content,
      req.body.link
    );
    return res.status(200).send({ message: "Correctamente modificado", modifiedCount });
  } catch (error) {
    next(error);
  }
};

export const fixedPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fixed } = req.body;
    const { modifiedCount } = await toggleFixed(req.params._id, fixed == 1 ? null : 1);
    return res.status(200).send({ message: "Correctamente modificado", modifiedCount });
  } catch (error) {
    next(error);
  }
};

export const savePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tosave, dni } = req.body;
    let mode: "add" | "remove" = "add";
    let message = "Publicación guardada";
    if (!tosave) {
      mode = "remove";
      message = "Se quitó de tus guardados";
    }
    const { modifiedCount } = await toggleSaved(req.params._id, dni, mode);
    return res.status(200).send({ message, modifiedCount });
  } catch (error) {
    next(error);
  }
};

export const destroyPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post_id = req.params.post_id;
    const socketId = req.params.socketId;
    const { deletedCount } = await deletePost(post_id);

    // socket
    if (deletedCount && socketId) {
      const socket = io.of("/").sockets.get(socketId);

      if (socket) {
        socket.broadcast.emit("post:delete", post_id);
      }
    }

    return res.status(200).send({ message: "Correctamente elimiando" });
  } catch (error) {
    next(error);
  }
};
