import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from '@/car/entities/car.entity';

export enum UserRole {
  CLIENT = 'client',
  SALES_PERSON = 'sales_person',
  OWNER = 'owner',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'roles',
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CLIENT],
  })
  roles: UserRole[];

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion: number;

  @OneToMany(() => Car, (car) => car.client)
  purchases: Car[];

  @OneToMany(() => Car, (car) => car.salesPerson)
  sales: Car[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
