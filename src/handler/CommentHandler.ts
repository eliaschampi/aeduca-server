import { NextFunction, Request, Response } from "express";
import CommentService from "../services/CommentService";
import {
  createComment as createCommentUseCase,
  deleteComment as deleteCommentUseCase,
  replyToComment as replyToCommentUseCase,
  updateComment as updateCommentUseCase
} from "../usecases/PostUseCases";

/**
 * CommentHandler - Clean architecture for comment endpoints
 */
class CommentHandler {
  /**
   * Create a new comment
   * POST /api/v1/comment
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        post_code,
        message,
        reply_to_code,
        content_type = "text",
        url,
        file_code
      } = req.body;
      const { dni } = req.params;

      const comment = await createCommentUseCase({
        dni,
        payload: {
          post_code: Number(post_code),
          message,
          reply_to_code: reply_to_code ? Number(reply_to_code) : undefined,
          content_type,
          url,
          file_code: file_code ? Number(file_code) : undefined
        }
      });

      res.status(201).json({
        message: "Comment created successfully",
        value: comment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comments for a post
   * GET /api/v1/comment/post/:post_code
   */
  async getPostComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { post_code } = req.params;
      const { page = 1, limit = 20, includeReplies = true } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const comments =
        includeReplies === "true" || includeReplies === true
          ? await CommentService.getPostComments(Number(post_code), Number(limit), offset)
          : await CommentService.getAllPostComments(Number(post_code));

      // Calculate total count from the query result
      const allComments = await CommentService.getAllPostComments(Number(post_code));
      const count = allComments.length;

      res.status(200).json({
        values: comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's comments
   * GET /api/v1/comment/user/:dni
   */
  async getUserComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const comments = await CommentService.getUserComments(dni, Number(limit), offset);

      res.status(200).json({
        values: comments,
        pagination: {
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a comment
   * PUT /api/v1/comment/:code
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, dni } = req.params;
      const { message } = req.body;

      // Check ownership
      const updatedComment = await updateCommentUseCase({
        dni,
        code: Number(code),
        message
      });

      res.status(200).json({
        message: "Comment updated successfully",
        value: updatedComment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reply to a comment
   * POST /api/v1/comment/:code/reply
   */
  async reply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, dni } = req.params;
      const { message, content_type = "text", url, file_code } = req.body;

      const reply = await replyToCommentUseCase({
        dni,
        code: Number(code),
        payload: {
          message,
          content_type,
          url,
          file_code: file_code ? Number(file_code) : undefined
        }
      });

      res.status(201).json({
        message: "Reply created successfully",
        value: reply
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   * DELETE /api/v1/comment/:code
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, dni } = req.params;

      await deleteCommentUseCase({
        dni,
        code: Number(code)
      });

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentHandler();
