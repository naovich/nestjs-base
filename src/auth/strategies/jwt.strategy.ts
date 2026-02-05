import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_MODULE_OPTIONS, USER_PROVIDER } from '../constants/auth.constants';
import type { AuthModuleOptions, JwtPayload, UserPayload, UserProviderInterface } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    options: AuthModuleOptions,
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProviderInterface,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    const user = await this.userProvider.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
