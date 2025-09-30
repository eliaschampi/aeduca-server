import { raw, ref, Transaction } from "objection";
import { Callvar, notInTrash } from "../config/const";
import File from "../model/File";
import FileShare from "../model/FileShare";
import Person from "../model/Person";

export const byCode = async (code: number): Promise<File | undefined> => {
  return File.query().findById(code);
};

export const byCodeIn = async (codes: number[]): Promise<File[]> => {
  return File.query().whereIn("code", codes);
};

export const searchQuery = async (dni: string, query: string): Promise<File[]> => {
  return File.query()
    .where(raw(`dni = '${dni}' and name ilike '%${query}%'`))
    .limit(10);
};

export const byUser = async (
  dni: string,
  parent_code: number | string,
  onlydir: boolean
): Promise<File[]> => {
  let filequery = `dni = '${dni}' and parent_path is null`;
  if (parent_code !== "null") filequery = `parent_code = ${parent_code}`;
  if (onlydir) filequery += " and type = 'dir'";

  return File.query().where(raw(filequery)).orderBy(raw("type != 'dir'"));
};

export const recentOrHeavy = async (dni: string, mode: string): Promise<File[]> => {
  const orderby = mode === "recent" ? "created_at" : "size";
  return File.query()
    .where(raw(`dni = '${dni}' and type != 'dir' and ${notInTrash}`))
    .orderBy(orderby, "DESC")
    .limit(10);
};

export const trashes = async (dni: string): Promise<File[]> => {
  return File.query()
    .where("dni", dni)
    .where("parent_path", "/trash/")
    .orderBy("created_at", "DESC");
};

export const byTag = async (dni: string, tag: string): Promise<File[]> => {
  return File.query().where("dni", dni).where("tag", tag).orderBy("created_at", "DESC");
};

export const updateTag = async (code: number, tag: string): Promise<number> => {
  return File.query().findById(code).patch({
    tag
  });
};

export const sumSize = async (dni: string): Promise<File | undefined> => {
  return File.query().select(raw("sum(file.size) as sum")).findOne({
    dni
  });
};

export const shareds = async (dni: string, section_code = ""): Promise<File[]> => {
  return File.query()
    .select([
      "file.*",
      Person.query()
        .where("dni", ref("file.dni"))
        .select(raw("concat(name,' ', lastname)"))
        .as("sh_entity"),
      raw(`(
        SELECT json_build_object(
          'message', fs.message,
          'share_code', fs.code,
          'receiver', fs.receiver
        )
        FROM fileshare fs 
        WHERE fs.file_code = file.code 
        AND fs.receiver IN ('${dni}','${section_code}','all')
        LIMIT 1
      ) as share_info`)
    ])
    .where("dni", "!=", dni)
    .whereExists(
      FileShare.query().whereRaw(
        `file_code = file.code and receiver in ('${dni}','${section_code}','all')`
      )
    )
    .orderBy("file.created_at", "DESC");
};

export const sharedsByMe = async (dni: string): Promise<File[]> => {
  return File.query()
    .select([
      "file.*",
      raw(`(
        SELECT json_agg(
          json_build_object(
            'receiver', fs.receiver,
            'message', fs.message,
            'share_code', fs.code
          )
        )
        FROM fileshare fs 
        WHERE fs.file_code = file.code
      ) as share_details`)
    ])
    .where("dni", dni)
    .whereExists(FileShare.query().whereRaw("file_code = file.code"))
    .orderBy("file.created_at", "DESC");
};

export const store = async (file: Record<string, unknown>): Promise<File> => {
  return File.query().insert(file);
};

const update = async (trx: Transaction, file: any): Promise<number> => {
  const code = file.code;
  delete file.code;
  return trx
    .from("file")
    .update({ ...file })
    .where("code", code);
};

const updateParentPath = async (
  trx: Transaction,
  dni: string,
  new_child_path: string,
  old_child_path: string
): Promise<any> => {
  return trx.raw(`
        update file set parent_path = replace(parent_path, '${old_child_path}', '${new_child_path}')
        where  dni = '${dni}' and parent_path like '${old_child_path}%'
  `);
};

export const storeWithTransaction = async (
  file_request: {
    code: number;
    name: string;
    parent_path: string | null;
    parent_code?: number | string;
  },
  joinedChildPath: Callvar,
  renameOrMove: Callvar
): Promise<boolean> => {
  return File.transaction(async (trx) => {
    const { code, name, parent_path } = file_request;
    let file: any = null;

    if (name) {
      file = await byCode(code);
    }

    await update(trx, file_request);

    if (file) {
      if (file.type === "dir") {
        const { old_child_path, new_child_path } = joinedChildPath(
          file.parent_path,
          file.name,
          parent_path,
          name
        );
        await updateParentPath(trx, file.dni, new_child_path, old_child_path);
      }
      await renameOrMove(file, name, parent_path);
    }
    return true;
  });
};

export async function destroy(code: number, deleteDirOrFile: Callvar): Promise<number> {
  const value: any = await File.query().findById(code);
  await deleteDirOrFile(value);
  return File.query().deleteById(value.code);
}

export const deleteTrash = async (
  dni: string,
  destroyTrashFiles: Callvar
): Promise<boolean> => {
  return File.transaction(async (tsx) => {
    await File.query(tsx).where("dni", dni).where("parent_path", "/trash/").delete();

    await destroyTrashFiles(dni);

    return true;
  });
};
