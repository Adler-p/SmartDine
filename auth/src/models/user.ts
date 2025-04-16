import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Password } from '../services/password';

export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  @Column()
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await Password.toHash(this.password);
    }
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
}
