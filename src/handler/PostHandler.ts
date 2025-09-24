import { NextFunction, Request, Response } from "express";
import PostService from "../services/PostService";
import { IPost } from "../model/Post";
import Person from "../model/Person";

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

      // Get creator details
      const creator = await Person.query()
        .select("name", "lastname", "profile.image")
        .leftJoin("profile", "person.dni", "profile.person_dni")
        .where("person.dni", dni)
        .first();

      if (!creator) {
        res.status(404).json({ message: "Creator not found" });
        return;
      }

      const postData: Partial<IPost> = {
        content,
        commentable: commentable !== false,
        link,
        creator_dni: dni,
        creator_name: `${creator.name} ${creator.lastname}`,
        creator_image: creator.image,
        share_with: share_with || ["all"],
        approved: approved || false
      };

      // Create post with files if provided
      const post =
        files && files.length > 0
          ? await PostService.createWithFiles(postData, files)
          : await PostService.create(postData);

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

      // Check ownership
      const post = await PostService.getById(Number(code));
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (post.creator_dni !== dni) {
        res.status(403).json({ message: "You can only edit your own posts" });
        return;
      }

      const updateData: Partial<IPost> = {};
      if (content !== undefined) updateData.content = content;
      if (commentable !== undefined) updateData.commentable = commentable;
      if (link !== undefined) updateData.link = link;
      if (share_with !== undefined) updateData.share_with = share_with;

      const updatedPost = await PostService.update(Number(code), updateData);

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
      const { rol_code } = req.body || {};

      // Check ownership or admin role
      const post = await PostService.getById(Number(code));
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (post.creator_dni !== dni && rol_code !== "a") {
        res.status(403).json({ message: "You can only delete your own posts" });
        return;
      }

      await PostService.delete(Number(code));

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

      const result = await PostService.toggleLike(Number(code), dni);

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

      const result = await PostService.toggleSave(Number(code), dni);

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
      const { approved, rol_code } = req.body;

      // Check admin role
      if (rol_code !== "a") {
        res.status(403).json({ message: "Only administrators can approve posts" });
        return;
      }

      const post = await PostService.setApprovalStatus(Number(code), approved);

      res.status(200).json({
        message: `Post ${approved ? "approved" : "rejected"}`,
        value: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search posts
   * GET /api/v1/post/search
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({ message: "Search query is required" });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const posts = await PostService.search(q, {
        approved: true,
        limit: Number(limit),
        offset
      });

      res.status(200).json({
        values: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          query: q
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post statistics
   * GET /api/v1/post/:code/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const stats = await PostService.getStats(Number(code));

      res.status(200).json({ value: stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostHandler();
