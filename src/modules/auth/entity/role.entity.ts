import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity({ name: 'role' })
export class RoleEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;
}
