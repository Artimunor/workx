import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../service/user.service';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UserService, configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_REDIRECT_URL'),
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      let user = await this.userService.findByEmail(profile.emails[0].value);
      if (!user) {
        user = new UserEntity();
      }

      user.email = profile.emails[0].value;
      user.firstName = profile.name.givenName;
      user.lastName = profile.name.familyName;
      user.profilePicturePath = profile.photos[0].value;
      user.googleToken = accessToken;
      user.googleRefreshToken = refreshToken;
      const {
        password,
        googleToken,
        googleRefreshToken,
        linkedInToken,
        linkedInRefreshToken,
        ...returnUser
      } = await this.userService.userCreateOrUpdate(user);
      done(null, returnUser);
    } catch (err) {
      done(err, false);
    }
  }
}
