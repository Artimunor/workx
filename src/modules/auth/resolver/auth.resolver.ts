import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RegisterInput } from '../input/register.input';
import { AuthService } from '../service/auth.service';
import { UserModel } from '../model/user.model';
import { LoginInput } from '../input/login.input';
import { UserEntity } from '../entity/user.entity';
import {
  CurrentUser,
  Jwt,
} from '../../../shared/decorators/context.decorators';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql.auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserModel)
  async userRegister(
    @Args({ name: 'registerInput', type: () => RegisterInput })
    registerInput: RegisterInput,
  ): Promise<UserModel> {
    return this.authService.userRegister(registerInput);
  }

  @Mutation(() => Boolean)
  async userConfirm(@Args('token') token: string): Promise<boolean> {
    return this.authService.userConfirm(token);
  }

  @Mutation(() => UserModel)
  async userLogin(
    @Args({ name: 'loginInput', type: () => LoginInput })
    loginInput: LoginInput,
  ): Promise<UserModel> {
    return this.authService.userLogin(loginInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async userLogout(
    @CurrentUser() user: UserEntity,
    @Jwt() token: string,
  ): Promise<boolean> {
    return this.authService.userLogout(user, token);
  }

  @Mutation(() => Boolean)
  async userForgotPassword(@Args('email') email: string): Promise<boolean> {
    return this.authService.userForgotPassword(email);
  }
}
