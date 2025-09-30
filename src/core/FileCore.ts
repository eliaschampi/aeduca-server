import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { FileEntity } from "../model/File";

/**
 * FileCore - Clean and efficient file management system
 */
class FileCore {
  private storageRoot: string;

  constructor() {
    // Default to '/drive' when STORAGE env variable is not provided
    this.storageRoot = process.env.STORAGE ?? "/drive";
    this.ensureStorageRoot();
  }

  /**
   * Ensure storage root directory exists
   */
  private async ensureStorageRoot(): Promise<void> {
    const absolutePath = path.resolve(this.storageRoot);
    try {
      await fs.access(absolutePath);
    } catch {
      await fs.mkdir(absolutePath, { recursive: true });
      console.log(`Created storage root: ${absolutePath}`);
    }
  }

  /**
   * Get the full path for a file entity
   */
  getFullPath(entity: FileEntity): string {
    const { dni, parent_path, name } = entity;
    const userDir = path.join(this.storageRoot, dni);

    // Handle root directory cases (null, empty, or root indicators)
    if (
      !parent_path ||
      parent_path === "null" ||
      parent_path === "/" ||
      parent_path === ""
    ) {
      return path.join(userDir, name);
    }

    // Handle trash directory
    if (parent_path === "/trash/") {
      return path.join(userDir, "trash", name);
    }

    // Handle other directories - remove leading/trailing slashes
    const cleanParentPath = parent_path.replace(/^\/|\/$/g, "");
    return path.join(userDir, cleanParentPath, name);
  }

  /**
   * Get user's root directory
   */
  getUserDirectory(dni: string): string {
    return path.join(this.storageRoot, dni);
  }

  /**
   * Ensure user directory exists
   */
  async ensureUserDirectory(dni: string): Promise<void> {
    const userDir = this.getUserDirectory(dni);
    await fs.mkdir(userDir, { recursive: true });
  }

  /**
   * Check if a path exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if path exists (sync version for compatibility)
   */
  existsSync(filePath: string): boolean {
    return fsSync.existsSync(filePath);
  }

  /**
   * Create a directory
   */
  async createDirectory(entity: FileEntity): Promise<FileEntity> {
    const fullPath = this.getFullPath(entity);

    // Ensure parent directories exist
    await fs.mkdir(fullPath, { recursive: true });

    return {
      ...entity,
      size: 0,
      type: "dir"
    };
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: UploadedFile,
    entity: FileEntity,
    maxSizeMB: number = 25
  ): Promise<{ success: boolean; message: string; entity?: FileEntity }> {
    try {
      // Validate file name
      const fileNameRegex = /^[a-zA-Z0-9_\-. ]+$/;
      if (!fileNameRegex.test(entity.name)) {
        return {
          success: false,
          message: "Nombre de archivo no valido"
        };
      }

      const fullPath = this.getFullPath(entity);

      // Check if file already exists
      if (await this.exists(fullPath)) {
        return {
          success: false,
          message: "File already exists"
        };
      }

      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          message: `File size exceeds ${maxSizeMB}MB limit`
        };
      }

      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await fs.mkdir(parentDir, { recursive: true });

      // Move file to destination
      await file.mv(fullPath);

      return {
        success: true,
        message: "File uploaded successfully",
        entity: {
          ...entity,
          size: file.size
        }
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed"
      };
    }
  }

  /**
   * Rename or move a file/directory
   */
  async renameOrMove(
    entity: FileEntity,
    newName: string,
    newParentPath?: string | null
  ): Promise<{ success: boolean; message: string }> {
    try {
      const oldPath = this.getFullPath(entity);

      if (!(await this.exists(oldPath))) {
        return {
          success: false,
          message: "Source file/directory not found"
        };
      }

      const newParentPathString = (
        newParentPath !== undefined ? newParentPath : entity.parent_path
      ) as string;

      const newEntity = {
        ...entity,
        name: newName,
        parent_path: newParentPathString
      };

      const newPath = this.getFullPath(newEntity);

      // Skip existence check if paths are the same (just updating database)
      if (oldPath !== newPath && (await this.exists(newPath))) {
        return {
          success: false,
          message: "Destination already exists"
        };
      }

      // Ensure destination directory exists
      const destDir = path.dirname(newPath);
      await fs.mkdir(destDir, { recursive: true });

      // Rename/move the file only if paths are different
      if (oldPath !== newPath) {
        await fs.rename(oldPath, newPath);
      }

      return {
        success: true,
        message: "Successfully renamed/moved"
      };
    } catch (error) {
      console.error("Rename/move error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Operation failed"
      };
    }
  }

  /**
   * Delete a file or directory
   */
  async delete(entity: FileEntity): Promise<{ success: boolean; message: string }> {
    try {
      const fullPath = this.getFullPath(entity);

      if (!(await this.exists(fullPath))) {
        return {
          success: true,
          message: "File/directory not found (already deleted)"
        };
      }

      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        await fs.rm(fullPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fullPath);
      }

      return {
        success: true,
        message: "Successfully deleted"
      };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Delete failed"
      };
    }
  }

  /**
   * Move to trash (special handling)
   */
  async moveToTrash(entity: FileEntity): Promise<{ success: boolean; message: string }> {
    const trashPath = path.join(this.getUserDirectory(entity.dni), "trash");

    // Ensure trash directory exists
    await fs.mkdir(trashPath, { recursive: true });

    return await this.renameOrMove(entity, entity.name, "/trash/");
  }

  /**
   * Empty trash for a user
   */
  async emptyTrash(dni: string): Promise<{ success: boolean; message: string }> {
    try {
      const trashPath = path.join(this.getUserDirectory(dni), "trash");

      if (await this.exists(trashPath)) {
        await fs.rm(trashPath, { recursive: true, force: true });
        // Recreate empty trash directory
        await fs.mkdir(trashPath, { recursive: true });
      }

      return {
        success: true,
        message: "Trash emptied successfully"
      };
    } catch (error) {
      console.error("Empty trash error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to empty trash"
      };
    }
  }

  /**
   * Get file/directory stats
   */
  async getStats(entity: FileEntity): Promise<fsSync.Stats | null> {
    try {
      const fullPath = this.getFullPath(entity);
      return await fs.stat(fullPath);
    } catch {
      return null;
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(entity: FileEntity): Promise<string[]> {
    try {
      const fullPath = this.getFullPath(entity);
      return await fs.readdir(fullPath);
    } catch {
      return [];
    }
  }

  /**
   * Create a read stream for file downloads
   */
  createReadStream(entity: FileEntity): fsSync.ReadStream {
    const fullPath = this.getFullPath(entity);
    return fsSync.createReadStream(fullPath);
  }

  /**
   * Get file size
   */
  async getFileSize(entity: FileEntity): Promise<number> {
    const stats = await this.getStats(entity);
    return stats?.size ?? 0;
  }

  /**
   * Calculate directory size recursively
   */
  async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      console.error("Error calculating directory size:", error);
    }

    return totalSize;
  }

  /**
   * Get user's total storage usage
   */
  async getUserStorageUsage(dni: string): Promise<number> {
    const userDir = this.getUserDirectory(dni);
    if (!(await this.exists(userDir))) {
      return 0;
    }
    return await this.getDirectorySize(userDir);
  }

  /**
   * Simple join path for parent path updates
   */
  joinParentPath(parentPath: string | null, folderName: string): string {
    if (parentPath && parentPath !== "/" && parentPath !== "null") {
      const cleanParent = parentPath.replace(/^\/|\/$/g, "");
      return `/${cleanParent}/${folderName}/`;
    }
    return `/${folderName}/`;
  }

  /**
   * Validate storage path to prevent directory traversal
   */
  isValidPath(pathToCheck: string): boolean {
    const normalizedPath = path.normalize(pathToCheck);
    const resolvedPath = path.resolve(this.storageRoot, normalizedPath);
    const resolvedRoot = path.resolve(this.storageRoot);

    return resolvedPath.startsWith(resolvedRoot);
  }
}

export default new FileCore();
