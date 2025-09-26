import { Model } from "objection";
import CommentModel from "./Comment";
import Person from "./Person";

export type IPostAttachment = {
  code: number;
  name: string;
  type: string;
  size: number;
  dni: string;
};

export type IPost = {
  code?: number;
  content: string;
  commentable: boolean;
  link?: string;
  likes?: string[];
  creator_dni: string;
  creator_name: string;
  creator_image?: string;
  share_with: string[];
  savelist?: string[];
  files?: IPostAttachment[];
  approved: boolean;
  created_at?: Date;
  updated_at?: Date;
};

class PostModel extends Model {
  code!: number;
  content!: string;
  commentable!: boolean;
  link?: string;
  likes?: string[];
  creator_dni!: string;
  creator_name!: string;
  creator_image?: string;
  share_with!: string[];
  savelist?: string[];
  files?: IPostAttachment[];
  approved!: boolean;
  created_at?: Date;
  updated_at?: Date;

  static get tableName(): string {
    return "post";
  }

  static get idColumn(): string {
    return "code";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["content", "creator_dni", "creator_name", "share_with"],
      properties: {
        code: { type: "integer" },
        content: { type: "string" },
        commentable: { type: "boolean" },
        link: { type: ["string", "null"] },
        likes: {
          type: ["array", "null"],
          items: { type: "string" }
        },
        creator_dni: { type: "string", minLength: 8, maxLength: 8 },
        creator_name: { type: "string" },
        creator_image: { type: ["string", "null"] },
        share_with: {
          type: "array",
          items: { type: "string" }
        },
        savelist: {
          type: ["array", "null"],
          items: { type: "string" }
        },
        files: {
          type: ["array", "null"],
          items: {
            type: "object",
            properties: {
              code: { type: "integer" },
              name: { type: "string" },
              type: { type: "string" },
              size: { type: "integer" },
              dni: { type: "string" }
            }
          }
        },
        approved: { type: "boolean" },
        created_at: { type: ["string", "null"] },
        updated_at: { type: ["string", "null"] }
      }
    };
  }

  static get jsonAttributes() {
    return ["files"];
  }

  static get relationMappings(): any {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: "post.creator_dni",
          to: "person.dni"
        }
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: CommentModel,
        join: {
          from: "post.code",
          to: "comment.post_code"
        }
      }
    };
  }

  // Helper method to check if a user has liked the post
  hasLiked(dni: string): boolean {
    return this.likes?.includes(dni) || false;
  }

  // Helper method to check if a user has saved the post
  hasSaved(dni: string): boolean {
    return this.savelist?.includes(dni) || false;
  }

  // Helper method to toggle like
  toggleLike(dni: string): string[] {
    if (!this.likes) {
      this.likes = [];
    }
    const index = this.likes.indexOf(dni);
    if (index > -1) {
      this.likes.splice(index, 1);
    } else {
      this.likes.push(dni);
    }
    return this.likes;
  }

  // Helper method to toggle save
  toggleSave(dni: string): string[] {
    if (!this.savelist) {
      this.savelist = [];
    }
    const index = this.savelist.indexOf(dni);
    if (index > -1) {
      this.savelist.splice(index, 1);
    } else {
      this.savelist.push(dni);
    }
    return this.savelist;
  }
}

export default PostModel;
