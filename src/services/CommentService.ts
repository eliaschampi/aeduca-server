import CommentModel, { IComment } from "../model/Comment";
import PostModel from "../model/Post";

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

    return CommentModel.query().insert(commentData);
  }

  /**
   * Get a single comment by ID
   */
  getById(code: number) {
    return CommentModel.query()
      .findById(code)
      .withGraphFetched("[from, replies(orderByCreated)]")
      .modifiers({
        orderByCreated(builder) {
          void builder.orderBy("created_at", "desc");
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

      return CommentModel.fromJson(payload);
    };

    const paginated = topLevelComments.slice(start, end);

    return paginated.map((comment) => convertToModel(comment));
  }

  /**
   * Get all comments for a post (including replies)
   */
  getAllPostComments(post_code: number) {
    return CommentModel.query()
      .where("post_code", post_code)
      .orderBy("created_at", "desc");
  }

  /**
   * Update a comment
   */
  update(code: number, updateData: Partial<IComment>) {
    return CommentModel.query().updateAndFetchById(code, {
      message: updateData.message ?? "",
      updated_at: new Date()
    });
  }

  delete(code: number) {
    return CommentModel.query().deleteById(code);
  }

  async replyToComment(
    comment_code: number,
    replyData: Partial<IComment>
  ): Promise<CommentModel> {
    const originalComment = await CommentModel.query().findById(comment_code);
    if (!originalComment) {
      throw new Error("Comentario original no encontrado");
    }

    const replyPayload = {
      ...replyData,
      post_code: originalComment.post_code,
      reply_to_code: comment_code
    };

    return this.create(replyPayload);
  }
}

export default new CommentService();
