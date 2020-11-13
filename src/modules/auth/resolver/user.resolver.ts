import { Resolver, Query, Mutation, Args, Info } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { UserEntity } from '../entity/user.entity';
import { UserInput } from '../input/user.input';
import { UserService } from '../service/user.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql.auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorators';

@UseGuards(GqlAuthGuard)
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @Query(() => [UserEntity])
  async userFind(
    @Args('id', { nullable: true }) id: number,
    @Args('firstName', { nullable: true }) firstName: string,
    @Args('lastName', { nullable: true }) lastName: string,
    @Args('email', { nullable: true }) email: string,
    @Args('entityKey', { nullable: true }) entityKey: string,
    @Args('confirmed', { nullable: true }) confirmed: boolean,
    @Args('active', { nullable: true }) active: boolean,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserEntity[]> {
    return this.userService.userFind(
      info,
      id,
      firstName,
      lastName,
      email,
      entityKey,
      confirmed,
      active,
    );
  }

  @Roles('admin')
  @Mutation(() => UserEntity, { nullable: true })
  async userUpdate(
    @Args('email') email: string,
    @Args('data') ui: UserInput,
  ): Promise<UserEntity | null> {
    return this.userService.userUpdate(email, ui);
  }

  @Roles('admin')
  @Mutation(() => Boolean)
  async userDelete(@Args('id') id: number): Promise<boolean> {
    return this.userService.userDelete(id);
  }

  @Roles('admin')
  @Mutation(() => UserEntity)
  async userGrantRole(
    @Args('id') id: number,
    @Args('roleName') roleName: string,
  ): Promise<UserEntity> {
    return await this.userService.userGrantRole(id, roleName);
  }

  @Roles('admin')
  @Mutation(() => UserEntity)
  async userRevokeRole(@Args('id') id: number): Promise<UserEntity> {
    return this.userService.userRevokeRole(id);
  }
}
