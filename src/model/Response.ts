import { Model } from "objection";
import Lesson from "./Lesson";
import Register from "./Register";

class Response extends Model {
  static get tableName(): string {
    return "response";
  }

  static get idColumn(): string[] {
    return ["lesson_code", "register_code"];
  }

  static get relationMappings(): any {
    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lesson,
        join: {
          from: "response.lesson_code",
          to: "lesson.code"
        }
      },
      register: {
        relation: Model.BelongsToOneRelation,
        modelClass: Register,
        join: {
          from: "response.register_code",
          to: "register.code"
        }
      }
    };
  }
}

export type IResponse = {
  lesson_code: number;
  register_code: string;
  response_message: string;
  received: boolean;
  files: number[];
};

export default Response;
