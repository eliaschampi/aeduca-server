import { raw, ref } from "objection";
import FileShare, { IFileShare } from "../model/FileShare";
import Person from "../model/Person";

export function sharedEntities(file_code: number) {
  return FileShare.query()
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
export function store(fileshare: IFileShare) {
  return FileShare.query().insert(fileshare).returning("*");
}

export function remove(code: number) {
  return FileShare.query().deleteById(code);
}
