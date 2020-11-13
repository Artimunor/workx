import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';

@ObjectType()
@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ name: 'unit_key', nullable: true })
  unitKey: string;

  @Field({ nullable: true })
  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Field({ nullable: true })
  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Field({ nullable: true })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'profile_picture_path', nullable: true })
  profilePicturePath: string;

  @Column({ name: 'google_token', nullable: true })
  googleToken: string;

  @Column({ name: 'google_refresh_token', nullable: true })
  googleRefreshToken: string;

  @Column({ name: 'linkedin_token', nullable: true })
  linkedInToken: string;

  @Column({ name: 'linkedin_refresh_token', nullable: true })
  linkedInRefreshToken: string;

  @Column({ nullable: true })
  password: string;

  @Column('bool', { default: false })
  confirmed: boolean;

  @Field()
  @Column('bool', { default: true })
  active: boolean;

  @Field({ nullable: true })
  @ManyToOne(() => RoleEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
