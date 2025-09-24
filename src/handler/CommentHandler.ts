import { NextFunction, Request, Response } from "express";
import CommentService from "../services/CommentService";
import { IComment } from "../model/Comment";
import Person from "../model/Person";

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

      // Get commenter details
      const commenter = await Person.query()
        .select("name", "lastname", "profile.image")
        .leftJoin("profile", "person.dni", "profile.person_dni")
        .where("person.dni", dni)
        .first();

      if (!commenter) {
        res.status(404).json({ message: "Commenter not found" });
        return;
      }

      const commentData: Partial<IComment> = {
        post_code,
        from_dni: dni,
        from_name: `${commenter.name} ${commenter.lastname}`,
        from_image: commenter.image,
        message,
        reply_to_code,
        content_type,
        url
      };

      // Create comment with attachment if file_code provided
      const comment = file_code
        ? await CommentService.createWithAttachment(commentData, file_code)
        : await CommentService.create(commentData);

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

      const count = await CommentService.getCommentCount(Number(post_code));

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
   * Get single comment by ID
   * GET /api/v1/comment/:code
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const comment = await CommentService.getById(Number(code));

      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      res.status(200).json({ value: comment });
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
      const comment = await CommentService.getById(Number(code));
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      if (comment.from_dni !== dni) {
        res.status(403).json({ message: "You can only edit your own comments" });
        return;
      }

      const updatedComment = await CommentService.update(Number(code), { message });

      res.status(200).json({
        message: "Comment updated successfully",
        value: updatedComment
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
      const { code } = req.params;
      const { dni } = req.params;
      const { rol_code } = req.body || {};

      // Check ownership or admin role
      const comment = await CommentService.getById(Number(code));
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      if (comment.from_dni !== dni && rol_code !== "a") {
        res.status(403).json({ message: "You can only delete your own comments" });
        return;
      }

      await CommentService.delete(Number(code));

      res.status(200).json({ message: "Comment deleted successfully" });
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

      // Get commenter details
      const commenter = await Person.query()
        .select("name", "lastname", "profile.image")
        .leftJoin("profile", "person.dni", "profile.person_dni")
        .where("person.dni", dni)
        .first();

      if (!commenter) {
        res.status(404).json({ message: "Commenter not found" });
        return;
      }

      const replyData: Partial<IComment> = {
        from_dni: dni,
        from_name: `${commenter.name} ${commenter.lastname}`,
        from_image: commenter.image,
        message,
        content_type,
        url
      };

      const reply = file_code
        ? await CommentService.createWithAttachment(
            { ...replyData, reply_to_code: Number(code) },
            file_code
          )
        : await CommentService.replyToComment(Number(code), replyData);

      res.status(201).json({
        message: "Reply created successfully",
        value: reply
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comment thread
   * GET /api/v1/comment/:code/thread
   */
  async getThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const thread = await CommentService.getCommentThread(Number(code));

      if (!thread) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      res.status(200).json({ value: thread });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comment count for a post
   * GET /api/v1/comment/post/:post_code/count
   */
  async getCommentCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { post_code } = req.params;

      const count = await CommentService.getCommentCount(Number(post_code));

      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentHandler();
