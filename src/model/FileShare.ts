import { Model } from "objection";

class FileShare extends Model {
  static get tableName(): string {
    return "fileshare";
  }

  static get idColumn(): string {
    return "code";
  }
}

export type IFileShare = {
  file_code: number;
  message: string;
  receiver: string;
};

export default FileShare;
