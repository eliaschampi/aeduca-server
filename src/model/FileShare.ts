import { Model } from "objection";

class FileShare extends Model {
  code!: number;
  file_code!: number;
  message!: string;
  receiver!: string;

  static get tableName(): string {
    return "fileshare";
  }

  static get idColumn(): string {
    return "code";
  }
}

export type IFileShare = {
  code?: number;
  file_code: number;
  message: string;
  receiver: string;
};

export default FileShare;
