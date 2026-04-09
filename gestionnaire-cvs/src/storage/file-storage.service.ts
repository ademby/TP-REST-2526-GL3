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
  ): Promise<string> {
    this.validateFile(file);

    const absoluteDirPath = join(this.uploadsDir, directory);
    await fs.mkdir(absoluteDirPath, { recursive: true });

    const safeExt = extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;
    const absolutePath = join(absoluteDirPath, fileName);

    await fs.writeFile(absolutePath, file.buffer);

    return join('uploads', directory, fileName).replace(/\\/g, '/');
  }
  async saveCvFile(file: Express.Multer.File): Promise<string> {
    return await this.saveFile(file, 'cv');
  }

  async deleteFileIfExists(relativePath: string): Promise<void> {
    const absolutePath = join(process.cwd(), relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch {
      // Ignore missing files or fs errors to avoid blocking DB updates.
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if ('multipart/form-data' === file.mimetype) {
      throw new BadRequestException('Unsupported file type');
    }

    const extension = extname(file.originalname).toLowerCase();

    if (!extension) {
      throw new BadRequestException('File extension is required');
    }

    // lazem we validate `more` this to avoid potential attacks
    // [list of allowed extensions]
  }
}
