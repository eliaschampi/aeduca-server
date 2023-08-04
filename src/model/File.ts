import { Model } from "objection";
import FileShare from "./FileShare";

export type FileEntity = {
  dni: string;
  name: string;
  parent_path?: string;
  parent_code?: number;
  size?: number;
  type?: "dir" | "doc" | "vid" | "img" | "aud" | "zip" | "otr";
};
//eslint-disable-next-line
export interface Attached extends FileEntity {
  code: number;
  full_route?: string;
  parent_path?: string;
  created_at?: string;
}

export type mimeTypes = {
  pdf: string;
  jpeg: string;
  jpg: string;
  png: string;
  svg: string;
  zip: string;
};

class File extends Model {
  static get tableName(): string {
    return "file";
  }

  static get idColumn(): string {
    return "code";
  }

  static get relationMappings(): any {
    return {
      fileshare: {
        relation: Model.HasManyRelation,
        modelClass: FileShare,
        join: {
          from: "file.code",
          to: "fileshare.file_code"
        }
      }
    };
  }
}

export default File;
