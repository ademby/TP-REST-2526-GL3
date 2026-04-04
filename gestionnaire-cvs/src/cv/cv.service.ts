import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv } from './entities/cv.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
  ) {}
  create(createCvDto: CreateCvDto) {
    return this.cvRepository.save(createCvDto);
  }

  async findAll() {
    return await this.cvRepository.find();
  }

  findOne(id: number) {
    return this.cvRepository.findOne({ where: { id } });
  }

  update(id: number, updateCvDto: UpdateCvDto) {
    return this.cvRepository.update(id, updateCvDto);
  }

  remove(id: number) {
    return this.cvRepository.delete(id);
  }
}
