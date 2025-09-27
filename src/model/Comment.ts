import { Model } from "objection";
import PostModel from "./Post";
import Person from "./Person";

export type IComment = {
  code?: number;
  post_code: number;
  from_dni: string;
  from_name: string;
  from_image?: string;
  message: string;
  reply_to_code?: number;
  content_type: string;
  url?: string;
  created_at?: Date;
  updated_at?: Date;
};

class CommentModel extends Model {
  code!: number;
  post_code!: number;
  from_dni!: string;
  from_name!: string;
  from_image?: string;
  message!: string;
  reply_to_code?: number;
  content_type!: string;
  url?: string;
  created_at?: Date;
  updated_at?: Date;

  static get tableName(): string {
    return "comment";
  }

  static get idColumn(): string {
    return "code";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["post_code", "from_dni", "from_name", "message", "content_type"],
      properties: {
        code: { type: "integer" },
        post_code: { type: "integer" },
        from_dni: { type: "string", minLength: 8, maxLength: 8 },
        from_name: { type: "string" },
        from_image: { type: ["string", "null"] },
        message: { type: "string" },
        reply_to_code: { type: ["integer", "null"] },
        content_type: { type: "string" },
        url: { type: ["string", "null"] },
        created_at: { type: ["string", "null"] },
        updated_at: { type: ["string", "null"] }
      }
    };
  }

  static get relationMappings(): any {
    return {
      post: {
        relation: Model.BelongsToOneRelation,
        modelClass: PostModel,
        join: {
          from: "comment.post_code",
          to: "post.code"
        }
      },
      from: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: "comment.from_dni",
          to: "person.dni"
        }
      },
      replyTo: {
        relation: Model.BelongsToOneRelation,
        modelClass: CommentModel,
        join: {
          from: "comment.reply_to_code",
          to: "comment.code"
        }
      },
      replies: {
        relation: Model.HasManyRelation,
        modelClass: CommentModel,
        join: {
          from: "comment.code",
          to: "comment.reply_to_code"
        }
      }
    };
  }
}

export default CommentModel;
