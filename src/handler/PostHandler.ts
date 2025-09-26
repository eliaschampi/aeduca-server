import { NextFunction, Request, Response } from "express";
import PostService from "../services/PostService";
import {
  createPost as createPostUseCase,
  deletePost as deletePostUseCase,
  setPostApproval as setPostApprovalUseCase,
  toggleLike as toggleLikeUseCase,
  toggleSave as toggleSaveUseCase,
  updatePost as updatePostUseCase
} from "../usecases/PostUseCases";

/**
 * PostHandler - Clean architecture for post endpoints
 */
class PostHandler {
  /**
   * Create a new post
   * POST /api/v1/post
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, commentable, link, share_with, files, approved } = req.body;
      const { dni } = req.params;

      const fileCodes = Array.isArray(files)
        ? files.map((value) => Number(value)).filter((value) => Number.isInteger(value))
        : undefined;

      const post = await createPostUseCase({
        dni,
        payload: {
          content,
          commentable,
          link,
          share_with,
          files: fileCodes,
          approved
        }
      });

      res.status(201).json({
        message: "Post created successfully",
        value: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts feed
   * GET /api/v1/post/feed
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
   * Get single post by ID
   * GET /api/v1/post/:code
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const post = await PostService.getById(Number(code));

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      res.status(200).json({ value: post });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's posts
   * GET /api/v1/post/user/:dni
   */
  async getUserPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const posts = await PostService.getUserPosts(dni, Number(limit), offset);

      res.status(200).json({
        values: posts,
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
   * Get saved posts
   * GET /api/v1/post/saved
   */
  async getSavedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const posts = await PostService.getSavedPosts(dni, Number(limit), offset);

      res.status(200).json({
        values: posts,
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
   * Update a post
   * PUT /api/v1/post/:code
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, dni } = req.params;
      const { content, commentable, link, share_with } = req.body;

      const updatedPost = await updatePostUseCase({
        dni,
        code: Number(code),
        payload: {
          content,
          commentable,
          link,
          share_with
        }
      });

      res.status(200).json({
        message: "Post updated successfully",
        value: updatedPost
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a post
   * DELETE /api/v1/post/:code
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, dni } = req.params;

      await deletePostUseCase({
        dni,
        code: Number(code)
      });

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle like on a post
   * POST /api/v1/post/:code/like
   */
  async toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const { dni } = req.body;

      const result = await toggleLikeUseCase({
        code: Number(code),
        dni
      });

      res.status(200).json({
        message: result.liked ? "Post liked" : "Post unliked",
        value: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle save on a post
   * POST /api/v1/post/:code/save
   */
  async toggleSave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const { dni } = req.body;

      const result = await toggleSaveUseCase({
        code: Number(code),
        dni
      });

      res.status(200).json({
        message: result.saved ? "Post saved" : "Post unsaved",
        value: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve or reject a post (admin only)
   * PATCH /api/v1/post/:code/approve
   */
  async setApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const { approved } = req.body;

      const post = await setPostApprovalUseCase({ code: Number(code), approved });

      res.status(200).json({
        message: `Post ${approved ? "approved" : "rejected"}`,
        value: post
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostHandler();
