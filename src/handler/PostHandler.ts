import { NextFunction, Request, Response } from "express";
import PostService from "../services/PostService";
import { toggleCommentable as toggleCommentableUseCase } from "../usecases/PostUseCases";

class PostHandler {
  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, section_code } = req.params;
      const { page = 1, limit = 20 } = req.query;
      if (!dni) {
        res.status(400).json({ message: "Parámetros inválidos" });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const posts = await PostService.getUserFeed(
        dni,
        section_code || "",
        Number(limit),
        offset
      );

      res.status(200).json({
        values: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: posts.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleCommentable(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { code, dni } = req.params;
      if (!code || !dni) {
        res.status(400).json({ message: "Parámetros inválidos" });
        return;
      }

      const updatedPost = await toggleCommentableUseCase({
        code: Number(code),
        dni
      });

      res.status(200).json({
        message: `Comentarios ${updatedPost.commentable ? "habilitados" : "deshabilitados"}`,
        value: updatedPost
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostHandler();
