import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { USER_PROVIDER } from '../constants/auth.constants';
import type { UserPayload, UserProviderInterface } from '../interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProviderInterface,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayload> {
    const user = await this.userProvider.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
