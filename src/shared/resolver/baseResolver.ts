import { Type } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { startLowerCase } from '../util/start-lower-case';

export function BaseResolver<
  IT extends Type<unknown>,
  RT extends Type<unknown>
>(InputType: IT, ReturnType: RT, EntityType: any): any {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    entityName = startLowerCase(EntityType.name);

    @Query((type) => [ReturnType], {
      name: this.entityName + 'Find',
    })
    async find(): Promise<any[]> {
      return EntityType.find();
    }

    @Mutation((type) => ReturnType, {
      name: this.entityName + 'Create',
    })
    async create(
      @Args({ name: 'data', type: () => InputType }) data: typeof InputType,
    ): Promise<any> {
      return EntityType.create(data).save();
    }

    @Mutation((type) => Boolean, {
      name: this.entityName + 'Delete',
    })
    async delete(@Args('id') id: number) {
      const res = await EntityType.delete(id);
      return res.affected == null ? false : res.affected > 0;
    }

    @Mutation((type) => Boolean, {
      name: this.entityName + 'Update',
    })
    async update(
      @Args('id') id: number,
      @Args({ name: 'data', type: () => InputType }) data: typeof InputType,
    ) {
      const entity = await EntityType.findOne(id);
      if (!entity) {
        throw new Error(`Unable to find ${this.entityName} with id: ${id}`);
      }

      await EntityType.update(id, data);

      return true;
    }
  }

  return BaseResolverHost;
}
