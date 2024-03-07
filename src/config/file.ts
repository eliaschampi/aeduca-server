import { joinpath } from "../core/FileCore";

export const getUrl = (encryptedPath: string): string => {
  const [dni, name, parent_path = ""] = Buffer.from(encryptedPath, "base64")
    .toString()
    .split("|") as [string, string, string];
  if (dni.length === 8) {
    return joinpath({ dni, name, parent_path });
  }
  throw new Error("not found");
};
