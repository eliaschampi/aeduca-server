import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import FileCore from "../core/FileCore";
import { FileEntity, mimeTypes } from "../model/File";
import {
  byCode,
  byUser,
  byTag,
  updateTag as updateTagService,
  destroy,
  recentOrHeavy,
  searchQuery,
  shareds,
  sharedsByMe,
  store,
  storeWithTransaction,
  sumSize,
  trashes,
  deleteTrash
} from "../services/FileService";
import { mimes } from "../config/const";

/**
 * Helper: Determine file type from extension
 */
const getFileType = (extension: string): FileEntity["type"] => {
  const ext = extension.toLowerCase().substring(1); // Remove the dot

  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"];
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "wma"];
  const docExts = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"];
  const zipExts = ["zip", "rar", "tar", "gz", "7z"];

  if (imageExts.includes(ext)) return "img";
  if (videoExts.includes(ext)) return "vid";
  if (audioExts.includes(ext)) return "aud";
  if (docExts.includes(ext)) return "doc";
  if (zipExts.includes(ext)) return "zip";

  return "otr";
};

/**
 * Get file by code
 * GET /api/v1/file/:code
 */
export const fetchByCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "Código es requerido" });
      return;
    }
    const value = await byCode(parseInt(code));

    if (!value) {
      res.status(404).json({ message: "Archivo no encontrado" });
      return;
    }

    res.status(200).json({ value });
  } catch (error) {
    next(error);
  }
};

/**
 * Search files
 * GET /api/v1/file/search/:dni/:query
 */
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni, query } = req.params;
    if (!dni || !query) {
      res.status(400).json({ message: "Campos dni y query son requeridos" });
      return;
    }
    const values = await searchQuery(dni, query);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get files by user
 * GET /api/v1/file/user/:dni/:parent_code/:onlydir
 */
export const fetchByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni, parent_code, onlydir } = req.params;
    if (!dni || !parent_code) {
      res.status(400).json({ message: "Campos dni y parent_code son requeridos" });
      return;
    }
    // Ensure user directory exists
    await FileCore.ensureUserDirectory(dni);

    const values = await byUser(dni, parent_code, onlydir === "true");
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent or heavy files
 * GET /api/v1/file/special/:dni/:mode
 */
export const fetchRecentOrHeavy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni, mode } = req.params;
    if (!dni || !mode) {
      res.status(400).json({ message: "Campos dni y mode son requeridos" });
      return;
    }
    const values = await recentOrHeavy(dni, mode);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trash files
 * GET /api/v1/file/trash/:dni
 */
export const fetchByTrash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ message: "Campo dni es requerido" });
      return;
    }
    const values = await trashes(dni);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get files by tag
 * GET /api/v1/file/tag/:dni/:tag
 */
export const fetchByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni, tag } = req.params;
    if (!dni || !tag) {
      res.status(400).json({ message: "Campos dni y tag son requeridos" });
      return;
    }
    const values = await byTag(dni, tag);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get storage usage
 * GET /api/v1/file/usage/:dni
 */
export const fetchSumSize = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ message: "Campo dni es requerido" });
      return;
    }
    // Get from database
    const dbSize: any = await sumSize(dni);

    // Get actual filesystem usage for accuracy
    const actualSize = await FileCore.getUserStorageUsage(dni);

    res.status(200).json({
      sum: dbSize?.sum || 0,
      actual: actualSize,
      unit: "bytes"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get files shared with me
 * GET /api/v1/file/shared-with-me/:dni/:section_code
 */
export const fetchSharedWithMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni, section_code } = req.params;
    if (!dni || !section_code) {
      res.status(400).json({ message: "Campos dni y section_code son requeridos" });
      return;
    }
    const values = await shareds(dni, section_code);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Get files shared by me
 * GET /api/v1/file/shared-by-me/:dni
 */
export const fetchSharedByMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ message: "Campo dni es requerido" });
      return;
    }
    const values = await sharedsByMe(dni);
    res.status(200).json({ values });
  } catch (error) {
    next(error);
  }
};

/**
 * Create directory
 * POST /api/v1/file/directory
 */
export const createDir = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const entityData: FileEntity = req.body;

    // Ensure user directory exists first
    await FileCore.ensureUserDirectory(entityData.dni);

    // Create directory in filesystem
    const directory = await FileCore.createDirectory(entityData);

    // Store in database
    const value = await store(directory);

    res.status(201).json({
      message: "Directorio creado exitosamente",
      value
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload file
 * POST /api/v1/file/upload
 */
export const storeFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files?.file) {
      res.status(400).json({ message: "No se proporciono un archivo" });
      return;
    }

    const file = req.files.file as UploadedFile;
    const entityData: FileEntity = JSON.parse(req.body.data);

    // Ensure user directory exists
    await FileCore.ensureUserDirectory(entityData.dni);

    // Determine file type based on extension
    const extension = path.extname(entityData.name).toLowerCase();
    const fileType = getFileType(extension);
    if (!fileType) {
      res.status(400).json({ message: "Tipo de archivo no soportado" });
      return;
    }
    entityData.type = fileType;

    // Upload file
    const uploadResult = await FileCore.uploadFile(file, entityData);

    if (!uploadResult.success) {
      res.status(400).json({ message: uploadResult.message });
      return;
    }

    // Store in database
    const value = await store(uploadResult.entity!);

    res.status(201).json({
      message: "Archivo subido exitosamente",
      value
    });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, tag } = req.body;
    const value = await updateTagService(code, tag);
    res.status(201).json({
      message: "Etiqueta modificada",
      value
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update file/directory (rename or move)
 * PUT /api/v1/file/update
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, name, parent_path, parent_code } = req.body;

    // Get existing file
    const existingFile = await byCode(code);
    if (!existingFile) {
      res.status(404).json({ message: "Archivo no encontrado" });
      return;
    }

    const currentFile = existingFile as FileEntity;

    // Detect restore operation: when only code is sent (name and parent_path are undefined)
    const isRestoreOperation = name === undefined && parent_path === undefined;
    const isFromTrash = currentFile.parent_path === "/trash/";

    let newName: string;
    let newParentPath: string | null;

    if (isRestoreOperation && isFromTrash) {
      // Restore from trash to root
      newName = currentFile.name;
      newParentPath = null;
    } else {
      // Regular rename/move operation
      newName = name || currentFile.name;
      newParentPath = parent_path !== undefined ? parent_path : currentFile.parent_path;
    }

    // Prepare for filesystem operation
    const renameResult = await FileCore.renameOrMove(currentFile, newName, newParentPath);

    if (!renameResult.success) {
      res.status(400).json({ message: renameResult.message });
      return;
    }

    // Update in database with transaction (handles child paths for directories)
    const joinedChildPath = (
      o_parent_path: string | null,
      o_name: string,
      n_parent_path: string | null,
      n_name: string
    ) => {
      const old_child_path = FileCore.joinParentPath(o_parent_path, o_name);
      const new_child_path = FileCore.joinParentPath(n_parent_path, n_name);
      return { old_child_path, new_child_path };
    };

    await storeWithTransaction(
      { code, name: newName, parent_path: newParentPath, parent_code },
      joinedChildPath,
      () => true // FileCore already handled the rename
    );

    const message =
      isRestoreOperation && isFromTrash
        ? "Archivo restaurado exitosamente"
        : "Archivo actualizado exitosamente";
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file/directory
 * DELETE /api/v1/file/:code
 */
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({ message: "Código es requerido" });
      return;
    }

    // Delete from filesystem and database
    await destroy(+code, async (entity: FileEntity) => {
      const result = await FileCore.delete(entity);
      if (!result.success) {
        throw new Error(result.message);
      }
    });

    res.status(200).json({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Move file to trash
 * POST /api/v1/file/:code/trash
 */
export const moveToTrash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "Código es requerido" });
      return;
    }
    // Get file details
    const file = await byCode(+code);
    if (!file) {
      res.status(404).json({ message: "Archivo no encontrado" });
      return;
    }

    // Move to trash
    const result = await FileCore.moveToTrash(file as FileEntity);
    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    // Update database
    await storeWithTransaction(
      { code: +code, name: file.name, parent_path: "/trash/" },
      () => ({ old_child_path: "", new_child_path: "" }),
      () => true
    );

    res.status(200).json({ message: "Archivo movido a la papelera exitosamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Empty trash
 * DELETE /api/v1/file/trash/:dni
 */
export const cleanTrash = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dni } = req.params;
    if (!dni) {
      res.status(400).json({ message: "DNI es requerido" });
      return;
    }
    // Delete from database and filesystem
    await deleteTrash(dni, async () => {
      const result = await FileCore.emptyTrash(dni);
      if (!result.success) {
        throw new Error(result.message);
      }
    });

    res.status(200).json({ message: "Papelera vaciada exitosamente" });
  } catch (error) {
    next(error);
  }
};

/**
 * Download file
 * GET /api/v1/file/download/:code
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "Código es requerido" });
      return;
    }

    const file = await byCode(+code);
    if (!file) {
      res.status(404).json({ message: "Archivo no encontrado" });
      return;
    }

    const entity = file as FileEntity;
    const fullPath = FileCore.getFullPath(entity);

    if (!FileCore.existsSync(fullPath)) {
      res.status(404).json({ message: "Archivo no encontrado en el sistema" });
      return;
    }

    // For directories, zip them first
    if (entity.type === "dir") {
      const archive = archiver("zip", { zlib: { level: 9 } });

      res.attachment(`${entity.name}.zip`);
      archive.pipe(res);
      archive.directory(fullPath, false);
      await archive.finalize();
    } else {
      res.download(fullPath, entity.name);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Stream media files (video, audio, documents)
 * GET /api/v1/file/stream/:code
 */
export const streamVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.sendStatus(404);
      return;
    }

    const file = await byCode(+code);
    if (!file) {
      res.sendStatus(404);
      return;
    }

    const entity = file as FileEntity;
    const fullPath = FileCore.getFullPath(entity);

    if (!FileCore.existsSync(fullPath)) {
      res.sendStatus(404);
      return;
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const extension = path.extname(entity.name).toLowerCase().substring(1);

    // Determine content type based on file extension
    let contentType = mimes[extension as keyof mimeTypes] || "application/octet-stream";

    // Special handling for common media types
    if (entity.type === "vid") {
      contentType = "video/mp4";
    } else if (entity.type === "aud") {
      contentType = "audio/mpeg";
    } else if (extension === "pdf") {
      contentType = "application/pdf";
    }

    const { range } = req.headers;

    if (range) {
      const [start, end] = range.replace(/bytes=/, "").split("-");
      const chunkStart = Number(start);
      const chunkEnd = Number(end) || fileSize - 1;
      const chunkSize = chunkEnd - chunkStart + 1;

      const stream = fs.createReadStream(fullPath, {
        start: chunkStart,
        end: chunkEnd
      });

      res.writeHead(206, {
        "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType
      });

      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes"
      });

      fs.createReadStream(fullPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming media:", error);
    res.sendStatus(404);
  }
};

/**
 * Serve image
 * GET /api/v1/file/image/:code
 */
export const serveImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.sendStatus(404);
      return;
    }
    const file = await byCode(+code);
    if (!file) {
      res.sendStatus(404);
      return;
    }

    const entity = file as FileEntity;
    const fullPath = FileCore.getFullPath(entity);

    if (!FileCore.existsSync(fullPath)) {
      res.sendStatus(404);
      return;
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const extension = path.extname(entity.name).toLowerCase().substring(1);

    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": mimes[extension as keyof mimeTypes] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600"
    });

    fs.createReadStream(fullPath).pipe(res);
  } catch (error) {
    console.error("Error serving image:", error);
    res.sendStatus(404);
  }
};
