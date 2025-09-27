import CommentModel, { IComment } from "../model/Comment";
import PostModel from "../model/Post";

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
      throw new Error("Post no encontrado");
    }

    if (!post.commentable) {
      throw new Error("Comentarios deshabilitados para este post");
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
    type CommentGraph = ReturnType<CommentModel["toJSON"]> & { replies: CommentGraph[] };

    const allComments = await CommentModel.query()
      .where("post_code", post_code)
      .withGraphFetched("from")
      .orderBy("created_at", "desc");

    const commentMap = new Map<number, CommentGraph>();
    const topLevelComments: CommentGraph[] = [];

    const serializeComment = (comment: CommentModel): CommentGraph => {
      const plain = comment.toJSON() as CommentGraph;
      return {
        ...plain,
        replies: []
      };
    };

    for (const comment of allComments) {
      const serialized = serializeComment(comment);
      commentMap.set(serialized.code, serialized);
    }

    for (const comment of allComments) {
      const current = commentMap.get(comment.code);
      if (!current) continue;

      if (comment.reply_to_code) {
        const parent = commentMap.get(comment.reply_to_code);
        if (parent) {
          parent.replies.push(current);
        }
      } else {
        topLevelComments.push(current);
      }
    }

    const sortByCreatedDesc = (items: CommentGraph[]) => {
      items.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

      for (const item of items) {
        if (item.replies.length > 0) {
          sortByCreatedDesc(item.replies);
        }
      }
    };

    sortByCreatedDesc(topLevelComments);

    const start = Math.max(0, offset);
    const end = start + Math.max(0, limit);

    const toIsoStringOrNull = (value: unknown): string | null => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value as string);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    };

    const convertToModel = (comment: CommentGraph): CommentModel => {
      const payload = {
        ...comment,
        created_at: toIsoStringOrNull(comment.created_at),
        updated_at: toIsoStringOrNull(comment.updated_at),
        replies: comment.replies.map((reply) => convertToModel(reply))
      };

      return CommentModel.fromJson(payload) as CommentModel;
    };

    const paginated = topLevelComments.slice(start, end);

    return paginated.map((comment) => convertToModel(comment));
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
      throw new Error("Comentario original no encontrado");
    }

    // Create reply with same post_id as original comment
    const replyPayload = {
      ...replyData,
      post_code: originalComment.post_code,
      reply_to_code: comment_code
    };

    return await this.create(replyPayload);
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
