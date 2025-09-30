import { WriteStream } from "fs";
import path from "path";
import archiver from "archiver";
import fs from "fs";

export enum COMPRESSION_LEVEL {
  uncompressed = 0,
  medium = 5,
  high = 9
}

export type ZipAFolderOptions = {
  compression?: COMPRESSION_LEVEL;
  customWriteStream?: WriteStream;
};

export class ZipAFolder {
  static async zip(srcFolder: string, zipFilePath: string): Promise<void | Error> {
    const o: ZipAFolderOptions = {
      compression: COMPRESSION_LEVEL.high
    };

    if (o.compression === COMPRESSION_LEVEL.uncompressed) {
      await ZipAFolder.compress({
        srcFolder,
        targetFilePath: zipFilePath,
        format: "zip",
        archiverOptions: {
          store: true
        }
      });
    } else {
      await ZipAFolder.compress({
        srcFolder,
        targetFilePath: zipFilePath,
        format: "zip",
        archiverOptions: {
          zlib: {
            level: o.compression
          }
        }
      });
    }
  }

  private static async compress({
    srcFolder,
    targetFilePath,
    format,
    archiverOptions
  }: {
    srcFolder: string;
    targetFilePath: string;
    format: archiver.Format;
    archiverOptions?: archiver.ArchiverOptions;
  }): Promise<void | Error> {
    const targetBasePath: string = path.dirname(targetFilePath);

    if (targetBasePath === srcFolder) {
      throw new Error("Fuente y destino deben ser diferentes.");
    }
    try {
      await fs.promises.access(srcFolder, fs.constants.R_OK | fs.constants.W_OK); //eslint-disable-line no-bitwise
      await fs.promises.access(targetBasePath, fs.constants.R_OK | fs.constants.W_OK); //eslint-disable-line no-bitwise
    } catch (error) {
      throw new Error(`Permission error: ${Error(<string>error).message}`);
    }

    const output: WriteStream = fs.createWriteStream(targetFilePath);
    const zipArchive: archiver.Archiver = archiver(format, archiverOptions ?? {});

    return new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);

      zipArchive.pipe(output);
      zipArchive.directory(srcFolder, false);
      zipArchive.finalize();
    });
  }
}

export const zip = ZipAFolder.zip;
