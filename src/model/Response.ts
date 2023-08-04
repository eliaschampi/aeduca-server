import { Model } from "objection";
import Activity from "./Activity";
import LessonFiles from "./LessonFiles";

class Response extends Model {
  static get tableName(): string {
    return "response";
  }

  static get idColumn(): string[] {
    return ["lesson_code", "register_code"];
  }

  static get relationMappings(): any {
    return {
      activity: {
        relation: Model.BelongsToOneRelation,
        modelClass: Activity,
        join: {
          from: "response.lesson_code",
          to: "activity.lesson_code"
        }
      },
      files: {
        relation: Model.HasManyRelation,
        modelClass: LessonFiles,
        join: {
          from: ["response.lesson_code", "response.register_code"],
          to: ["lesson_files.lesson_code", "lesson_files.register_code"]
        }
      }
    };
  }
}

export type IResponse = {
  lesson_code: number;
  register_code: string;
  response_message: string;
  files: any[];
};

export default Response;
