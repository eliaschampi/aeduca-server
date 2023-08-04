import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import { Callvar, fileVal } from "../config/const";
import { FileEntity } from "../model/File";

export function joinpath({ dni, parent_path, name }: FileEntity): string {
  const STORAGE: string = <string>process.env.STORAGE;

  if (parent_path && parent_path !== "null") {
    return path.join(STORAGE, dni, parent_path, name);
  }

  return path.join(STORAGE, dni, name);
}

export function checkPath(checkablepath: string): boolean {
  return fs.existsSync(checkablepath);
}

export function simplejoinpath(parent_path: string, foldername: string): string {
  if (parent_path) {
    return path.join(parent_path, foldername, "/");
  }
  return `/${foldername}/`;
}

export function deleteSimple(fullparent: string, name: string): void {
  const fullpath = path.join(fullparent, name);
  if (checkPath(fullpath)) {
    fs.unlinkSync(fullpath);
  }
}

export function uploadSimple(
  file: UploadedFile,
  parent: string,
  name: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const fullpath = path.join(parent, name);
    file.mv(fullpath, (err: any) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

export function checkPathAndGet(fileEntity: FileEntity): string {
  const fullpath = joinpath(fileEntity);
  if (!checkPath(fullpath)) {
    throw new Error("Archivo no encontrado");
  }
  return fullpath;
}

export const createDirectory = (fileEntity: FileEntity): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.mkdir(joinpath(fileEntity), { recursive: true }, (err) => {
      if (err) reject(err);
      resolve({
        ...fileEntity,
        size: 0,
        type: "dir"
      });
    });
  });
};

export const uploadFile = (
  myfile: UploadedFile,
  p_type: string,
  fileEntity: FileEntity,
  cb: Callvar
): void => {
  const fullpath = joinpath(fileEntity);
  if (!fileVal.test(fileEntity.name)) {
    throw new Error("Archivo no admitido");
  }
  if (checkPath(fullpath)) {
    throw new Error("El archivo ya existe");
  }
  if (myfile.size > (p_type === "t" ? 60 : 25) * 1024 * 1024) {
    throw new Error("límite de peso excedido");
  }
  myfile.mv(fullpath, (err) => {
    if (err) {
      throw new Error(err.message);
    }
    cb({ status: 200, message: "Un archivo se subió con éxito", fullpath });
  });
};

export const renameOrMove = (
  file: FileEntity,
  new_name: string,
  new_pp: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const oldpath = joinpath(file);
    if (!checkPath(oldpath)) {
      reject({ message: "Archivo no encontrado" });
    }

    const newpath = joinpath({
      dni: file.dni,
      parent_path: new_pp,
      name: new_name
    });

    if (checkPath(newpath)) {
      reject({ message: "El archivo ya existe" });
    }

    if (new_pp === "/trash/") {
      const jointrash = path.join(<string>process.env.STORAGE, file.dni, new_pp);
      if (!checkPath(jointrash)) {
        fs.mkdirSync(jointrash);
      }
    }

    fs.rename(oldpath, newpath, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

export const deleteDirOrFile = (fileEntity: FileEntity): Promise<any> => {
  const fullpath = joinpath(fileEntity);
  return new Promise((resolve, reject) => {
    if (checkPath(fullpath)) {
      if (fileEntity.type === "dir") {
        fs.rmdir(fullpath, { recursive: true }, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      } else {
        fs.unlink(fullpath, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      }
    } else {
      resolve(false);
    }
  });
};

export const deleteTrashFolder = (dni: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const fullpath = joinpath({ dni, parent_path: "trash", name: "" });
    fs.rmdir(fullpath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

export const charResourcesPath = (room: string, filename = ""): string => {
  return path.join(<string>process.env.CHAT_RESOURCES, `room_${room}`, filename);
};

export const deleteRoomFolder = (room: string): Promise<boolean> => {
  const fullpath = charResourcesPath(room);
  return new Promise((resolve, reject) => {
    if (checkPath(fullpath)) {
      fs.rmdir(fullpath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });
};
