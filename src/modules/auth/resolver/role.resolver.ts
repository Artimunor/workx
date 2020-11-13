import { UseGuards } from '@nestjs/common';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Roles } from '../../../shared/decorators/roles.decorators';
import { GqlAuthGuard } from '../guards/gql.auth.guard';
import { RoleEntity } from '../entity/role.entity';
import { RoleInput } from '../input/role.input';
import { RoleService } from '../service/role.service';

@UseGuards(GqlAuthGuard)
@Resolver()
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Roles('admin')
  @Query(() => [RoleEntity])
  async roleFind(
    @Args('id', { nullable: true }) id: number,
    @Args('name', { nullable: true }) name: string,
    @Args('description', { nullable: true }) description: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<RoleEntity[]> {
    return this.roleService.roleFind(info, id, name, description);
  }

  @Roles('admin')
  @Mutation(() => RoleEntity)
  roleCreate(@Args('data') ri: RoleInput): Promise<RoleEntity> {
    return this.roleService.roleCreate(ri);
  }

  @Roles('admin')
  @Mutation(() => RoleEntity, { nullable: true })
  async roleUpdate(
    @Args('id') id: number,
    @Args('role') ri: RoleInput,
  ): Promise<RoleEntity> {
    return this.roleService.roleUpdate(id, ri);
  }

  @Roles('admin')
  @Mutation(() => Boolean)
  async roleDelete(@Args('id') id: number): Promise<boolean> {
    return this.roleService.roleDelete(id);
  }
}
