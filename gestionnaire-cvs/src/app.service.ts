import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Cv } from './cv/entities/cv.entity';
import { Skill } from './skill/entities/skill.entity';
import {
  randUserName,
  randEmail,
  randPassword,
  randFirstName,
  randLastName,
  randNumber,
  randJobTitle,
  randFilePath,
  randSkill,
} from '@ngneat/falso';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cv) private cvRepository: Repository<Cv>,
    @InjectRepository(Skill) private skillRepository: Repository<Skill>,
  ) {}

  async seedDatabase() {
    const skills: Skill[] = [];
    for (let i = 0; i < 5; i++) {
      const skill = this.skillRepository.create({ designation: randSkill() });
      skills.push(await this.skillRepository.save(skill));
    }

    //  5 Fake Users
    const users: User[] = [];
    for (let i = 0; i < 5; i++) {
      const user = this.userRepository.create({
        username: randUserName(),
        email: randEmail(),
        password: randPassword(),
      });
      users.push(await this.userRepository.save(user));
    }

    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];

      const cv = this.cvRepository.create({
        name: randLastName(),
        firstname: randFirstName(),
        age: randNumber({ min: 18, max: 60 }),
        cin: randNumber({ min: 10000000, max: 99999999 }).toString(),
        job: randJobTitle(),
        path: randFilePath(),
        user: randomUser,
        skills: [randomSkill],
      });
      await this.cvRepository.save(cv);
    }

    return 'Database successfully seeded with fake data!';
  }
}
