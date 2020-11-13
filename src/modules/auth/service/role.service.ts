import { Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from '../../../shared/util/parse-resolve-info';
import { RoleEntity } from '../entity/role.entity';
import { RoleInput } from '../input/role.input';

@Injectable()
export class RoleService {
  public async roleFind(
    info: GraphQLResolveInfo,
    id?: number,
    name?: string,
    description?: string,
  ): Promise<RoleEntity[]> {
    const resultInfo = parseResolveInfo(info);
    if (resultInfo) {
      let rq = RoleEntity.createQueryBuilder('role');

      if (id) {
        rq = rq.andWhere('role.id = :id', {
          id: id,
        });
      }

      if (name) {
        rq = rq.andWhere('role.name = :name', {
          name: name,
        });
      }

      if (description) {
        rq = rq.andWhere('role.description = :description', {
          description: description,
        });
      }

      return rq.getMany();
    } else {
      throw new Error('Unable to parse graphql info object');
    }
  }

  public async roleCreate(ri: RoleInput): Promise<RoleEntity> {
    return await RoleEntity.create({
      name: ri.name,
      description: ri.description,
    }).save();
  }

  public async roleDelete(id: number): Promise<boolean> {
    const res = await RoleEntity.delete(id);
    return res.affected == null ? false : res.affected > 0;
  }

  public async roleUpdate(id: number, ri: RoleInput): Promise<RoleEntity> {
    const role = await RoleEntity.findOne(id);
    if (!role) {
      return null;
    }

    if (ri.name) {
      role.name = ri.name;
    }

    if (ri.description) {
      role.description = ri.description;
    }

    return role.save();
  }
}
