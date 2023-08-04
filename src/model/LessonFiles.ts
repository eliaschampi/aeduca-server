import { Model } from "objection";
import File from "./File";

class LessonFiles extends Model {
  static get tableName(): string {
    return "lesson_files";
  }

  static get idColumn(): string {
    return "code";
  }

  static get relationMappings(): any {
    return {
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: "lesson_files.file_code",
          to: "file.code"
        }
      }
    };
  }
}

export default LessonFiles;
