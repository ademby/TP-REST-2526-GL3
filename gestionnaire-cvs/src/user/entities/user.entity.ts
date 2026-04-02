import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  // The '1' side of the relationship: One User has Many CVs
  @OneToMany(() => Cv, (cv) => cv.user)
  cvs!: Cv[];
}
