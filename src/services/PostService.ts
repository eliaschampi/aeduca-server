import { Transaction } from "objection";
import PostModel, { IPost, IPostAttachment } from "../model/Post";
import CommentModel from "../model/Comment";
import { byCodeIn } from "./FileService";

type PostFilters = {
  dni?: string;
  section_code?: string;
  approved?: boolean;
  limit?: number;
  offset?: number;
};

type PostWithStats = IPost & {
  comment_count?: number;
  latest_comment?: any;
};

class PostService {
  /**
   * Create a new post
   */
  async create(postData: Partial<IPost>): Promise<PostModel> {
    return await PostModel.query().insert(postData);
  }

  /**
   * Get a single post by ID
   */
  async getById(code: number): Promise<PostModel | undefined> {
    return await PostModel.query()
      .findById(code)
      .withGraphFetched("[creator, comments(orderByCreated)]")
      .modifiers({
        orderByCreated(builder: any) {
          builder.orderBy("created_at", "desc");
        }
      });
  }

  /**
   * Get posts with filters
   */
  async getPosts(filters: PostFilters): Promise<PostWithStats[]> {
    let query = PostModel.query()
      .select("post.*")
      .leftJoin("comment", "post.code", "comment.post_code")
      .groupBy("post.code")
      .orderBy("post.created_at", "desc");

    // Add comment count
    query = query.select(PostModel.raw("COUNT(DISTINCT comment.code) as comment_count"));

    // Apply filters
    if (filters.approved !== undefined) {
      query = query.where("post.approved", filters.approved);
    }

    if (filters.dni) {
      // Get posts visible to this user
      query = query.where(function () {
        this.where("post.creator_dni", filters.dni!)
          .orWhereRaw("? = ANY(post.share_with)", ["all"])
          .orWhereRaw("? = ANY(post.share_with)", [filters.section_code || ""]);
      });
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const posts = await query;

    // Get latest comment for each post
    for (const post of posts) {
      const latestComment = await CommentModel.query()
        .where("post_code", post.code)
        .orderBy("created_at", "desc")
        .first();

      (post as PostWithStats).latest_comment = latestComment;
    }

    return posts as PostWithStats[];
  }

  /**
   * Get posts for a specific user's feed
   */
  async getUserFeed(
    dni: string,
    section_code: string,
    limit = 20,
    offset = 0
  ): Promise<PostWithStats[]> {
    return await this.getPosts({
      dni,
      section_code,
      approved: true,
      limit,
      offset
    });
  }

  /**
   * Get posts created by a specific user
   */
  async getUserPosts(dni: string, limit = 20, offset = 0): Promise<PostModel[]> {
    return await PostModel.query()
      .where("creator_dni", dni)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get saved posts for a user
   */
  async getSavedPosts(dni: string, limit = 20, offset = 0): Promise<PostModel[]> {
    return await PostModel.query()
      .whereRaw("? = ANY(savelist)", [dni])
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update a post
   */
  async update(code: number, updateData: Partial<IPost>): Promise<PostModel> {
    return await PostModel.query().updateAndFetchById(code, updateData);
  }

  /**
   * Delete a post
   */
  async delete(code: number): Promise<number> {
    return await PostModel.query().deleteById(code);
  }

  /**
   * Toggle like on a post
   */
  async toggleLike(
    postCode: number,
    dni: string
  ): Promise<{ liked: boolean; count: number }> {
    const post = await PostModel.query().findById(postCode);

    if (!post) {
      throw new Error("Post not found");
    }

    const likes = post.toggleLike(dni);
    await PostModel.query().findById(postCode).patch({ likes });

    return {
      liked: likes.includes(dni),
      count: likes.length
    };
  }

  /**
   * Toggle save on a post
   */
  async toggleSave(postCode: number, dni: string): Promise<{ saved: boolean }> {
    const post = await PostModel.query().findById(postCode);

    if (!post) {
      throw new Error("Post not found");
    }

    const savelist = post.toggleSave(dni);
    await PostModel.query().findById(postCode).patch({ savelist });

    return {
      saved: savelist.includes(dni)
    };
  }

  /**
   * Approve or reject a post
   */
  async setApprovalStatus(postId: number, approved: boolean): Promise<PostModel> {
    return await PostModel.query().updateAndFetchById(postId, { approved });
  }

  /**
   * Search posts by content
   */
  async search(query: string, filters: PostFilters): Promise<PostModel[]> {
    let searchQuery = PostModel.query()
      .where("content", "ilike", `%${query}%`)
      .orderBy("created_at", "desc");

    if (filters.approved !== undefined) {
      searchQuery = searchQuery.where("approved", filters.approved);
    }

    if (filters.limit) {
      searchQuery = searchQuery.limit(filters.limit);
    }

    return await searchQuery;
  }

  /**
   * Get post statistics
   */
  async getStats(postCode: number): Promise<any> {
    const post = await PostModel.query().findById(postCode);

    if (!post) {
      throw new Error("Post not found");
    }

    const commentCountResult = await CommentModel.query()
      .where("post_code", postCode)
      .count("code as count")
      .first();

    const commentsCount = Number((commentCountResult as any)?.count ?? 0);

    return {
      likes_count: post.likes?.length || 0,
      saves_count: post.savelist?.length || 0,
      comments_count: commentsCount
    };
  }

  /**
   * Create post with transaction
   */
  async createWithFiles(
    postData: Partial<IPost>,
    fileCodes: number[]
  ): Promise<PostModel> {
    return await PostModel.transaction(async (trx: Transaction) => {
      // Get file details
      let files: IPostAttachment[] = [];
      if (fileCodes.length > 0) {
        const fileRecords = await byCodeIn(fileCodes);
        files = fileRecords.map((f) => ({
          code: f.code,
          name: f.name,
          type: f.type ?? "otr",
          size: f.size ?? 0,
          dni: f.dni
        }));
      }

      // Create post with files
      const post = await PostModel.query(trx).insert({
        ...postData,
        files
      });

      return post;
    });
  }
}

export default new PostService();
