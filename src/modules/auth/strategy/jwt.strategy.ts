import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../service/auth.service';
import { JwtInput } from '../input/jwt.input';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtInput) {
    const token = request.headers.authorization.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException();
    }

    const blacklisted = await this.authService.isJwtBlacklisted(token);
    if (blacklisted) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.validateUser(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const {
      password,
      googleToken,
      googleRefreshToken,
      linkedInToken,
      linkedInRefreshToken,
      ...returnUser
    } = user;

    return returnUser;
  }
}
