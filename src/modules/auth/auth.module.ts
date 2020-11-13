import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './service/auth.service';
import { RedisModule } from '../redis/redis.module';
import { AuthResolver } from './resolver/auth.resolver';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { GqlAuthGuard } from './guards/gql.auth.guard';
import { JwtConfigService } from '../../config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './service/user.service';
import { UserResolver } from './resolver/user.resolver';
import { RoleEntity } from './entity/role.entity';
import { RoleService } from './service/role.service';
import { RoleResolver } from './resolver/role.resolver';
import { AuthController } from './controller/auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { LinkedInStrategy } from './strategy/linkedin.strategy';
import { AvatarController } from './controller/avatar.controller';
import { MeResolver } from './resolver/me.resolver';

@Module({
  imports: [
    RedisModule,
    MailerModule,
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    TypeOrmModule.forFeature([UserEntity, RoleEntity]),
  ],
  providers: [
    GqlAuthGuard,
    AuthResolver,
    AuthService,
    AuthController,
    JwtStrategy,
    GoogleStrategy,
    LinkedInStrategy,
    UserResolver,
    UserService,
    MeResolver,
    RoleResolver,
    RoleService,
    AvatarController,
  ],
  exports: [AuthService, UserService, RoleService],
})
export class AuthModule {}
