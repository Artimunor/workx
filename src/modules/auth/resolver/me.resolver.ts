import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { UserEntity } from '../entity/user.entity';
import { UserInput } from '../input/user.input';
import { UserService } from '../service/user.service';
import { GqlAuthGuard } from '../guards/gql.auth.guard';
import { CurrentUser } from '../../../shared/decorators/context.decorators';
import { UserModel } from '../model/user.model';

@UseGuards(GqlAuthGuard)
@Resolver('me')
export class MeResolver {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Query(() => UserEntity)
  async me(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @Mutation(() => Boolean)
  async meAddProfilePicture(
    @CurrentUser() user: UserEntity,
    @Args('picture', { type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
  ): Promise<boolean> {
    const writeResult: Promise<boolean> = new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(
          createWriteStream(
            `./${this.configService.get('MULTER_DEST')}/${filename}`,
          ),
        )
        .on('finish', () => resolve(true))
        .on('error', () => reject(false)),
    );

    const url =
      `http://${this.configService.get('SERVER_HOST')}:` +
      this.configService.get('SERVER_PORT') +
      `/avatar/${filename}`;

    this.userService.userUpdate(user.email, {
      profilePicturePath: url,
    });

    return writeResult;
  }

  @Mutation(() => UserEntity, { nullable: true })
  async meUpdate(
    @CurrentUser() me: UserModel,
    @Args('data') ui: UserInput,
  ): Promise<UserEntity | null> {
    return this.userService.userUpdate(me.email, ui);
  }

  @Mutation(() => Boolean)
  async meDelete(@CurrentUser() me: UserEntity): Promise<boolean> {
    return this.userService.userDelete(me.id);
  }
}
