import { Controller, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '../entity/user.entity';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('google')
  @UseGuards(AuthGuard('google'))
  async googleSignIn(@Query('returnTo') returnTo: string) {}

  @Post('googlecallback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const user = req.user as UserEntity;
    const frontendPort = this.configService.get('FRONTEND_PORT');
    const redirect =
      this.configService.get('FRONTEND_HOST') +
      (frontendPort ? ':' + frontendPort : '');

    res
      .set({
        token: this.authService.signToken({ userId: user.id }),
      })
      .redirect(301, redirect);
  }

  @Post('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedInSignIn() {}

  @Post('linkedincallback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedInCallback(@Req() req: any, @Res() res: any) {
    const user = req.user as UserEntity;
    const frontendPort = this.configService.get('FRONTEND_PORT');
    const redirect =
      this.configService.get('FRONTEND_HOST') + frontendPort
        ? ':' + frontendPort
        : '';

    res
      .set({
        token: this.authService.signToken({ userId: user.id }),
      })
      .redirect(301, redirect);
  }
}
