import { Injectable } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { getManager } from 'typeorm';
import { v4 } from 'uuid';
import { parseResolveInfo } from '../../../shared/util/parse-resolve-info';
import { PersonEntity } from '../../unit/entity/person.entity';
import { UnitCategory, UnitEntity } from '../../unit/entity/unit.entity';
import { RoleEntity } from '../entity/role.entity';
import { UserEntity } from '../entity/user.entity';
import { UserInput } from '../input/user.input';

@Injectable()
export class UserService {
  public async userFind(
    info: GraphQLResolveInfo,
    id?: number,
    firstName?: string,
    lastName?: string,
    email?: string,
    entityKey?: string,
    confirmed?: boolean,
    active?: boolean,
  ): Promise<UserEntity[]> {
    const resultInfo = parseResolveInfo(info);
    if (resultInfo) {
      const reqFields = resultInfo.fieldsByTypeName.UserEntity;

      let eq = UserEntity.createQueryBuilder('user');

      const entityRequested = reqFields.hasOwnProperty('userEntity');
      if (entityKey) {
        if (entityRequested) {
          eq = eq.leftJoinAndSelect('user.userEntity', 'wpentity');
        } else {
          eq = eq.leftJoin('user.userEntity', 'wpentity');
        }
        eq = eq.andWhere('wpentity.key = :entityKey', { entityKey: entityKey });
      } else {
        if (entityRequested) {
          eq = eq.leftJoinAndSelect('user.userEntity', 'wpentity');
        }
      }

      if (id) {
        eq = eq.andWhere('user.id = :id', {
          id: id,
        });
      }

      if (firstName) {
        eq = eq.andWhere('user.firstName ILIKE :firstName', {
          firstName: `%${firstName}%`,
        });
      }

      if (lastName) {
        eq = eq.andWhere('user.lastName ILIKE :lastName', {
          lastName: `%${lastName}%`,
        });
      }

      if (email) {
        eq = eq.andWhere('user.email = :email', {
          email: email,
        });
      }

      if (confirmed != null && confirmed != undefined) {
        eq = eq.andWhere('user.confirmed = :confirmed', {
          confirmed: confirmed,
        });
      }

      if (active != null && active != undefined) {
        eq = eq.andWhere('user.active = :active', {
          active: active,
        });
      }

      return eq.getMany();
    } else {
      throw new Error('Unable to parse graphql info object');
    }
  }

  public async findByEmail(email: string): Promise<UserEntity | undefined> {
    return UserEntity.findOne({ email: email });
  }

  public async findById(id: number): Promise<UserEntity | undefined> {
    return UserEntity.findOne(id);
  }

  public async userCreate(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    const key = v4();

    const unit = new UnitEntity();
    unit.key = key;
    unit.name = email;
    unit.category = UnitCategory.PERSON;

    const user = new UserEntity();
    user.email = email;
    user.password = password;
    user.unitKey = key;

    const person = new PersonEntity();

    return await getManager().transaction(
      async (transactionalEntityManager) => {
        const savedUnit = await transactionalEntityManager.save(unit);
        person.unit = savedUnit;
        await transactionalEntityManager.save(person);
        return await transactionalEntityManager.save(user);
      },
    );
  }

  public async userCreateOrUpdate(user: UserEntity): Promise<UserEntity> {
    return await user.save();
  }

  public async userDelete(id: number): Promise<boolean> {
    const res = await UserEntity.delete(id);
    return res.affected == null ? false : res.affected > 0;
  }

  public async userUpdate(email: string, ui: UserInput): Promise<UserEntity> {
    const user = await UserEntity.findOne({ email: email });
    if (!user) {
      return null;
    }

    let unit = undefined;
    if (user.unitKey) {
      unit = await UnitEntity.findOne({ key: user.unitKey });
    }

    if (ui.firstName) {
      user.firstName = ui.firstName;
    }

    if (ui.middleName) {
      user.middleName = ui.middleName;
    }

    if (ui.lastName) {
      user.lastName = ui.lastName;
    }

    if (unit && (ui.firstName || ui.middleName || ui.lastName)) {
      unit.name =
        (ui.firstName
          ? ui.firstName + (ui.middleName || ui.lastName ? ' ' : '')
          : '') +
        (ui.middleName ? ui.middleName + (ui.lastName ? ' ' : '') : '') +
        (ui.lastName ? ui.lastName : '');
    }

    if (ui.email) {
      user.email = ui.email;
    }

    if (ui.phoneNumber) {
      user.phoneNumber = ui.phoneNumber;
    }

    return await getManager().transaction(
      async (transactionalEntityManager) => {
        if (ui.firstName || ui.middleName || ui.lastName) {
          await transactionalEntityManager.save(unit);
        }
        return await transactionalEntityManager.save(user);
      },
    );
  }

  public async userConfirm(id: number): Promise<boolean> {
    const user = await UserEntity.findOne(id);
    if (!user) {
      return null;
    }
    user.confirmed = true;

    await user.save();

    return true;
  }

  public async userGrantRole(
    id: number,
    roleName: string,
  ): Promise<UserEntity> {
    const user = await UserEntity.findOne(id);
    if (!user) {
      throw new Error('User does not exist');
    }

    const role = await RoleEntity.findOne({ name: roleName });
    if (!role) {
      throw new Error('Role with name [' + roleName + '] does not exist');
    }

    user.role = role;

    return user.save();
  }

  public async userRevokeRole(id: number): Promise<UserEntity> {
    const user = await UserEntity.findOne(id);
    if (!user) {
      throw new Error('User does not exist');
    }

    user.role = null;

    return user.save();
  }
}
