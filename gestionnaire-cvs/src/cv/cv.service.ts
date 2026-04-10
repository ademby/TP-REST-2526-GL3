import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { FileStorageService } from '../storage/file-storage.service';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  create(createCvDto: CreateCvDto, userId: number) {
    const cv = this.cvRepository.create({
      ...createCvDto,
      user: { id: userId } as User,
    });

    return this.cvRepository.save(cv);
  }

  async findAllForAdmin() {
    return await this.cvRepository.find();
  }

  async findAll(userId: number) {
    return await this.cvRepository.find({
      where: { user: { id: userId } },
    });
  }

  findOne(id: number, userId: number) {
    return this.cvRepository.findOne({
      where: { id, user: { id: userId } },
    });
  }

  async update(id: number, updateCvDto: UpdateCvDto, userId: number) {
    const existingCv = await this.findOne(id, userId);

    if (!existingCv) {
      throw new NotFoundException(`CV not found`);
    }

    const updatedCv = this.cvRepository.merge(existingCv, updateCvDto);
    return this.cvRepository.save(updatedCv);
  }

  async remove(id: number, userId: number) {
    const existingCv = await this.findOne(id, userId);

    if (!existingCv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    await this.cvRepository.remove(existingCv);
    return { message: `CV with id ${id} deleted` };
  }

  async uploadCvFile(id: number, userId: number, file: Express.Multer.File) {
    const existingCv = await this.findOne(id, userId);

    if (!existingCv) {
      throw new NotFoundException(`CV not found`);
    }

    const oldPath = existingCv.path;
    const newPath = await this.fileStorageService.saveCvFile(file);

    existingCv.path = newPath;
    const savedCv = await this.cvRepository.save(existingCv);

    if (oldPath && oldPath !== newPath) {
      await this.fileStorageService.deleteFileIfExists(oldPath);
    }

    return savedCv;
  }
}
