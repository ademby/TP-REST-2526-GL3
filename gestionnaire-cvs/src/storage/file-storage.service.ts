import { BadRequestException, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';

@Injectable()
export class FileStorageService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  async saveFile(
    file: Express.Multer.File,
    directory: string,
    options?: {
      allowedMimeTypes?: string[];
      allowedExtensions?: string[];
      kind?: string;
    },
  ): Promise<string> {
    this.validateFile(file, options);

    const absoluteDirPath = join(this.uploadsDir, directory);
    await fs.mkdir(absoluteDirPath, { recursive: true });

    const safeExt = extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;
    const absolutePath = join(absoluteDirPath, fileName);

    await fs.writeFile(absolutePath, file.buffer);

    return join('uploads', directory, fileName).replace(/\\/g, '/');
  }
  async saveCvFile(file: Express.Multer.File): Promise<string> {
    return await this.saveFile(file, 'cv', {
      allowedMimeTypes: ['application/pdf'],
      allowedExtensions: ['.pdf'],
      kind: 'PDF',
    });
  }

  async saveImageFile(file: Express.Multer.File): Promise<string> {
    return await this.saveFile(file, 'image', {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      kind: 'image',
    });
  }

  async deleteFileIfExists(relativePath: string): Promise<void> {
    const absolutePath = join(process.cwd(), relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch {
      // Ignore missing files or fs errors to avoid blocking DB updates.
    }
  }

  private validateFile(
    file: Express.Multer.File,
    options?: {
      allowedMimeTypes?: string[];
      allowedExtensions?: string[];
      kind?: string;
    },
  ): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const extension = extname(file.originalname).toLowerCase();

    if (!extension) {
      throw new BadRequestException('File extension is required');
    }

    const allowedExtensions = options?.allowedExtensions ?? [];
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Unsupported ${options?.kind ?? 'file'} extension`,
      );
    }

    const allowedMimeTypes = options?.allowedMimeTypes ?? [];
    if (
      allowedMimeTypes.length > 0 &&
      !allowedMimeTypes.includes(file.mimetype.toLowerCase())
    ) {
      throw new BadRequestException(`Unsupported ${options?.kind ?? 'file'} type`);
    }
  }
}
