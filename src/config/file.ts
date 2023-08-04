import { joinpath } from "../core/FileCore";
import { FileEntity } from "../model/File";

export const getUrl = (encryptedPath: string): string => {
  const splited = Buffer.from(encryptedPath, "base64").toString().split("|");
  if (splited.length > 1 && splited.length < 4 && splited[0].length === 8) {
    const entityData: FileEntity = {
      dni: splited[0],
      name: splited[1],
      parent_path: splited[2] || ""
    };
    return joinpath(entityData);
  } else {
    throw new Error("not found");
  }
};
