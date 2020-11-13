import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { UserService } from '../service/user.service';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private userService: UserService, configService: ConfigService) {
    super({
      clientID: configService.get('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get('LINKEDIN_REDIRECT_URL'),
      passReqToCallback: true,
      scope: ['r_liteprofile', 'r_emailaddress'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
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
      user.linkedInToken = accessToken;
      user.linkedInRefreshToken = refreshToken;
      const {
        password,
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
