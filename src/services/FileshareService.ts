import { raw, ref } from "objection";
import FileShare, { IFileShare } from "../model/FileShare";
import Person from "../model/Person";

export async function sharedEntities(file_code: number): Promise<FileShare[]> {
  return await FileShare.query()
    .select([
      "fileshare.*",
      Person.query()
        .select(raw(`concat(name,' ', lastname) as entity`))
        .where("dni", ref("fileshare.receiver"))
        .as("entity")
    ])
    .where({
      file_code
    });
}

//
export async function store(fileshare: IFileShare): Promise<FileShare> {
  return await FileShare.query().insert(fileshare).returning("*");
}

export async function remove(code: number): Promise<number> {
  return await FileShare.query().deleteById(code);
}
