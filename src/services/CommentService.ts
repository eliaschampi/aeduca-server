import { Transaction } from "objection";
import CommentModel, { IComment, ICommentAttachment } from "../model/Comment";
import PostModel from "../model/Post";
import { byCode } from "./FileService";

type CommentFilters = {
  post_code?: number;
  from_dni?: string;
  limit?: number;
  offset?: number;
};

class CommentService {
  /**
   * Create a new comment
   */
  async create(commentData: Partial<IComment>): Promise<CommentModel> {
    // Verify post exists
    const post = await PostModel.query().findById(commentData.post_code!);
    if (!post) {
      throw new Error("Post not found");
    }

    if (!post.commentable) {
      throw new Error("Comments are disabled for this post");
    }

    return await CommentModel.query().insert(commentData);
  }

  /**
   * Get a single comment by ID
   */
  async getById(code: number): Promise<CommentModel | undefined> {
    return await CommentModel.query()
      .findById(code)
      .withGraphFetched("[from, replies(orderByCreated)]")
      .modifiers({
        orderByCreated(builder) {
          builder.orderBy("created_at", "desc");
        }
      });
  }

  /**
   * Get comments for a post
   */
  async getPostComments(
    post_code: number,
    limit = 20,
    offset = 0
  ): Promise<CommentModel[]> {
    return await CommentModel.query()
      .where("post_code", post_code)
      .whereNull("reply_to_code") // Only get top-level comments
      .withGraphFetched("replies(orderByCreated)")
      .modifiers({
        orderByCreated(builder) {
          builder.orderBy("created_at", "desc");
        }
      })
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get all comments for a post (including replies)
   */
  async getAllPostComments(post_code: number): Promise<CommentModel[]> {
    return await CommentModel.query()
      .where("post_code", post_code)
      .orderBy("created_at", "desc");
  }

  /**
   * Get comments by user
   */
  async getUserComments(dni: string, limit = 20, offset = 0): Promise<CommentModel[]> {
    return await CommentModel.query()
      .where("from_dni", dni)
      .withGraphFetched("post")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update a comment
   */
  async update(code: number, updateData: Partial<IComment>): Promise<CommentModel> {
    // Only allow updating message and updated_at
    const allowedUpdates = {
      message: updateData.message,
      updated_at: new Date()
    };

    return await CommentModel.query().updateAndFetchById(code, allowedUpdates);
  }

  /**
   * Delete a comment
   */
  async delete(code: number): Promise<number> {
    // This will cascade delete all replies due to foreign key constraint
    return await CommentModel.query().deleteById(code);
  }

  /**
   * Get comment count for a post
   */
  async getCommentCount(post_code: number): Promise<number> {
    const result = await CommentModel.query()
      .where("post_code", post_code)
      .count("* as count")
      .first();

    return parseInt(String((result as any)?.count || "0"));
  }

  /**
   * Get reply count for a comment
   */
  async getReplyCount(commentCode: number): Promise<number> {
    const result = await CommentModel.query()
      .where("reply_to_code", commentCode)
      .count("* as count")
      .first();

    return parseInt(String((result as any)?.count || "0"));
  }

  /**
   * Create comment with attachment
   */
  async createWithAttachment(
    commentData: Partial<IComment>,
    fileCode?: number
  ): Promise<CommentModel> {
    return await CommentModel.transaction(async (trx: Transaction) => {
      // Get file details if provided
      let attached: ICommentAttachment | undefined;
      if (fileCode) {
        const file = await byCode(fileCode);
        if (file) {
          attached = {
            code: file.code,
            name: file.name,
            type: file.type || "otr",
            size: file.size || 0,
            dni: file.dni
          };
        }
      }

      // Create comment with attachment
      const comment = await CommentModel.query(trx).insert({
        ...commentData,
        attached
      });

      return comment;
    });
  }

  /**
   * Get comments with filters
   */
  async getComments(filters: CommentFilters): Promise<CommentModel[]> {
    let query = CommentModel.query().orderBy("created_at", "desc");

    if (filters.post_code) {
      query = query.where("post_code", filters.post_code);
    }

    if (filters.from_dni) {
      query = query.where("from_dni", filters.from_dni);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  /**
   * Reply to a comment
   */
  async replyToComment(
    comment_code: number,
    replyData: Partial<IComment>
  ): Promise<CommentModel> {
    // Get original comment to verify it exists and get post_id
    const originalComment = await CommentModel.query().findById(comment_code);
    if (!originalComment) {
      throw new Error("Original comment not found");
    }

    // Create reply with same post_id as original comment
    return await this.create({
      ...replyData,
      post_code: originalComment.post_code,
      reply_to_code: comment_code
    });
  }

  /**
   * Get comment thread (comment with all its replies)
   */
  async getCommentThread(comment_code: number): Promise<CommentModel | undefined> {
    return await CommentModel.query()
      .findById(comment_code)
      .withGraphFetched("replies.^"); // Recursive fetch all nested replies
  }

  /**
   * Count comments by user in date range
   */
  async countUserComments(
    dni: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let query = CommentModel.query().where("from_dni", dni);

    if (startDate) {
      query = query.where("created_at", ">=", startDate);
    }

    if (endDate) {
      query = query.where("created_at", "<=", endDate);
    }

    const result = await query.count("* as count").first();
    return parseInt(String((result as any)?.count || "0"));
  }
}

export default new CommentService();
