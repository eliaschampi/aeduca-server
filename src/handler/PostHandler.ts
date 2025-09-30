import { NextFunction, Request, Response } from "express";
import PostService from "../services/PostService";
import { toggleCommentable as toggleCommentableUseCase } from "../usecases/PostUseCases";

/**
 * PostHandler - Clean architecture for post endpoints
 */
class PostHandler {
  /**
   * Get posts feed
   * GET /api/v1/post/feed/:dni/:section_code?
   */
  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, section_code } = req.params;
      const { page = 1, limit = 20 } = req.query;

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

  /**
   * Toggle commentable state on a post
   * PATCH /api/v1/post/:code/commentable/:dni
   */
  async toggleCommentable(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { code, dni } = req.params;

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
