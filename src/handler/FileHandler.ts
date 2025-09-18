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
  destroy,
  recentOrHeavy,
  searchQuery,
  shareds,
  store,
  storeWithTransaction,
  sumSize,
  trashes,
  deleteTrash
} from "../services/FileService";
import { mimes } from "../config/const";

/**
 * FileHandler - Clean architecture for file management endpoints
 */
class FileHandler {
  /**
   * Get file by code
   * GET /api/v1/file/:code
   */
  async fetchByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const value = await byCode(parseInt(code));
      
      if (!value) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      res.status(200).json({ data: value });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search files
   * GET /api/v1/file/search/:dni/:query
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, query } = req.params;
      const values = await searchQuery(dni, query);
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get files by user
   * GET /api/v1/file/user/:dni/:parent_code/:onlydir
   */
  async fetchByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, parent_code, onlydir } = req.params;
      
      // Ensure user directory exists
      await FileCore.ensureUserDirectory(dni);
      
      const values = await byUser(dni, parent_code, onlydir === "true");
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent or heavy files
   * GET /api/v1/file/special/:dni/:mode
   */
  async fetchRecentOrHeavy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, mode } = req.params;
      const values = await recentOrHeavy(dni, mode);
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trash files
   * GET /api/v1/file/trash/:dni
   */
  async fetchByTrash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      const values = await trashes(dni);
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get files by tag
   * GET /api/v1/file/tag/:dni/:tag
   */
  async fetchByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, tag } = req.params;
      const values = await byTag(dni, tag);
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get storage usage
   * GET /api/v1/file/usage/:dni
   */
  async fetchSumSize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      
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
  }

  /**
   * Get shared files
   * GET /api/v1/file/shared/:dni/:section_code
   */
  async fetchShared(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni, section_code } = req.params;
      const values = await shareds(dni, section_code);
      res.status(200).json({ data: values });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create directory
   * POST /api/v1/file/directory
   */
  async createDir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityData: FileEntity = req.body;
      
      // Ensure user directory exists first
      await FileCore.ensureUserDirectory(entityData.dni);
      
      // Create directory in filesystem
      const directory = await FileCore.createDirectory(entityData);
      
      // Store in database
      const value = await store(directory);
      
      res.status(201).json({ 
        message: "Directory created successfully", 
        data: value 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload file
   * POST /api/v1/file/upload
   */
  async storeFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !req.files.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }

      const file = req.files.file as UploadedFile;
      const entityData: FileEntity = JSON.parse(req.body.data);
      
      // Ensure user directory exists
      await FileCore.ensureUserDirectory(entityData.dni);
      
      // Determine file type based on extension
      const extension = path.extname(entityData.name).toLowerCase();
      const fileType = this.getFileType(extension);
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
        message: "File uploaded successfully", 
        data: value 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update file/directory (rename or move)
   * PUT /api/v1/file/update
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, name, parent_path } = req.body;
      
      // Get existing file
      const existingFile = await byCode(code);
      if (!existingFile) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      // Prepare for filesystem operation
      const renameResult = await FileCore.renameOrMove(
        existingFile as FileEntity,
        name || existingFile.name,
        parent_path !== undefined ? parent_path : existingFile.parent_path
      );

      if (!renameResult.success) {
        res.status(400).json({ message: renameResult.message });
        return;
      }

      // Update in database with transaction (handles child paths for directories)
      const joinedChildPath = (
        o_parent_path: string,
        o_name: string,
        n_parent_path: string,
        n_name: string
      ) => {
        const old_child_path = FileCore.joinParentPath(o_parent_path, o_name);
        const new_child_path = FileCore.joinParentPath(n_parent_path, n_name);
        return { old_child_path, new_child_path };
      };

      await storeWithTransaction(
        req.body,
        joinedChildPath,
        async () => true // FileCore already handled the rename
      );

      res.status(200).json({ message: "File updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file/directory
   * DELETE /api/v1/file/:code
   */
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      
      // Delete from filesystem and database
      await destroy(+code, async (entity: FileEntity) => {
        const result = await FileCore.delete(entity);
        if (!result.success) {
          throw new Error(result.message);
        }
      });

      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Move file to trash
   * POST /api/v1/file/:code/trash
   */
  async moveToTrash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      
      // Get file details
      const file = await byCode(+code);
      if (!file) {
        res.status(404).json({ message: "File not found" });
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
        { code: +code, parent_path: "/trash/" },
        () => ({ old_child_path: "", new_child_path: "" }),
        async () => true
      );

      res.status(200).json({ message: "File moved to trash" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Empty trash
   * DELETE /api/v1/file/trash/:dni
   */
  async cleanTrash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dni } = req.params;
      
      // Delete from database and filesystem
      await deleteTrash(dni, async () => {
        const result = await FileCore.emptyTrash(dni);
        if (!result.success) {
          throw new Error(result.message);
        }
      });

      res.status(200).json({ message: "Trash emptied successfully" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download file
   * GET /api/v1/file/download/:code
   */
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      
      const file = await byCode(+code);
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      const entity = file as FileEntity;
      const fullPath = FileCore.getFullPath(entity);

      if (!FileCore.existsSync(fullPath)) {
        res.status(404).json({ message: "File not found on filesystem" });
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
  }

  /**
   * Stream video
   * GET /api/v1/file/stream/:code
   */
  async streamVideo(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
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
      const { range } = req.headers;

      if (range) {
        const [start, end] = range.replace(/bytes=/, "").split("-");
        const chunkStart = Number(start);
        const chunkEnd = Number(end) || fileSize - 1;
        const chunkSize = chunkEnd - chunkStart + 1;
        
        const stream = fs.createReadStream(fullPath, { start: chunkStart, end: chunkEnd });
        
        res.writeHead(206, {
          "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4"
        });
        
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4"
        });
        
        fs.createReadStream(fullPath).pipe(res);
      }
    } catch (error) {
      res.sendStatus(404);
    }
  }

  /**
   * Serve image
   * GET /api/v1/file/image/:code
   */
  async serveImage(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
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
        "Content-Type": mimes[extension as keyof mimeTypes] || "application/octet-stream"
      });
      
      fs.createReadStream(fullPath).pipe(res);
    } catch (error) {
      res.sendStatus(404);
    }
  }

  /**
   * Helper: Determine file type from extension
   */
  private getFileType(extension: string): FileEntity["type"] {
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
  }
}

export default new FileHandler();
