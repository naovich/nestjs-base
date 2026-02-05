import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { USER_PROVIDER } from './constants/auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { JwtPayload, UserPayload, UserProviderInterface } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_PROVIDER)
    private readonly userProvider: UserProviderInterface,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserPayload): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async register(email: string, password: string): Promise<AuthResponseDto> {
    const existing = await this.userProvider.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userProvider.createUser(email, password);
    return this.login(user);
  }

  async validateUser(email: string, password: string): Promise<UserPayload> {
    const user = await this.userProvider.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async getProfile(userId: string): Promise<UserPayload> {
    const user = await this.userProvider.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
