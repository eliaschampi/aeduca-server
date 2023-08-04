import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { getUrl } from "../config/file";
import { mimes } from "../config/const";
import { zip } from "../core/ZipProvider";
import {
  checkPathAndGet,
  createDirectory,
  deleteDirOrFile,
  deleteTrashFolder,
  renameOrMove,
  simplejoinpath,
  uploadFile
} from "../core/FileCore";
import {
  byCode,
  byTag,
  byUser,
  deleteTrash,
  destroy,
  recentOrHeavy,
  searchQuery,
  shareds,
  store,
  storeWithTransaction,
  sumSize,
  trashes
} from "../services/FileService";
import { FileEntity, mimeTypes } from "../model/File";

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, query } = req.params;
    const values = await searchQuery(dni, query);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, parent_code, onlydir } = req.params;
    const values = await byUser(dni, parent_code, onlydir === "true");
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchRecentOrHeavy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dni, mode } = req.params;
    const values = await recentOrHeavy(dni, mode);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTrash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni } = req.params;
    const values = await trashes(dni);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchByTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, tag } = req.params;
    const values = await byTag(dni, tag);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const fetchSumSize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni } = req.params;
    const value: any = await sumSize(dni);
    return res.status(200).send({ sum: value.sum });
  } catch (error) {
    next(error);
  }
};

export const fetchShared = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dni, section_code } = req.params;
    const values = await shareds(dni, section_code);
    return res.status(200).send({ values });
  } catch (error) {
    next(error);
  }
};

export const createDir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const directory = await createDirectory(req.body);
    const value = await store(directory);
    return res.status(200).json({ message: "Correctamente creado", value });
  } catch (error) {
    next(error);
  }
};

export const storeFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.files) {
      const file = <UploadedFile>req.files.file;
      const entitydata: FileEntity = JSON.parse(req.body.data);
      uploadFile(file, req.body.person_type, entitydata, async (data: any) => {
        const value = await store(entitydata);
        res.status(data.status).json({ message: data.message, value });
      });
    }
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const joinedChildPath = (
      o_parent_path: string,
      o_name: string,
      n_parent_path: string,
      n_name: string
    ) => {
      const old_child_path = simplejoinpath(o_parent_path, o_name);
      const new_child_path = simplejoinpath(n_parent_path, n_name);
      return { old_child_path, new_child_path };
    };
    await storeWithTransaction(req.body, joinedChildPath, renameOrMove);
    return res.status(200).json({ message: "Correctamente modificado" });
  } catch (error) {
    let message = Error(<string>error).message;
    if (message.indexOf("unique_filename") !== -1) {
      message = "Un archivo con ese nombre ya existe en el directorio";
    }
    return res.status(500).send({ message });
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await destroy(+req.params.code, deleteDirOrFile);
    return res.status(200).send({ message: "Correctamente Eliminado" });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file: any = await byCode(+req.params.code);
    const fullpath = checkPathAndGet(file);
    if (file.type === "dir") {
      let temp_zipname = (Math.floor(Math.random() * 9999) + 1000).toString();
      temp_zipname = `${process.env.STORAGE}/temp/${temp_zipname}.zip`;
      await zip(fullpath, temp_zipname);
      res.download(temp_zipname);
    } else {
      res.download(fullpath);
    }
  } catch (error) {
    next(error);
  }
};

export const cleanTrash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTrash(req.params.dni, deleteTrashFolder);
    return res.status(200).send({ message: "Correctamente Eliminado" });
  } catch (error) {
    next(error);
  }
};

export const streamVideo = async (req: Request, res: Response) => {
  try {
    const fullpath = getUrl(req.params.fullpath);
    const stat = fs.statSync(fullpath);
    const fileSize = stat.size;
    const { range } = req.headers;
    if (range) {
      const [s, e] = (<string>range).replace(/bytes=/, "").split("-");
      const start = Number(s);
      const end = Number(e) || fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(fullpath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4"
      };
      res.writeHead(200, head);
      fs.createReadStream(fullpath).pipe(res);
    }
  } catch (error) {
    return res.sendStatus(404);
  }
};

export const serveImage = async (req: Request, res: Response) => {
  try {
    const fullpath = getUrl(req.params.fullpath);
    const stat = fs.statSync(fullpath);
    const fileSize = stat.size;
    const extension = fullpath.substr(-6).split(".").pop();
    const head = {
      "Content-Length": fileSize,
      "Content-Type": mimes[extension as keyof mimeTypes]
    };
    res.writeHead(200, head);
    fs.createReadStream(fullpath).pipe(res);
  } catch (error) {
    console.log(error);
    return res.sendStatus(404);
  }
};
