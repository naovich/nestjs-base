import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_MODULE_OPTIONS } from './constants/auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { AuthModuleAsyncOptions, AuthModuleOptions } from './interfaces';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      global: options.global ?? false,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options.jwt.secret,
          signOptions: { expiresIn: options.jwt.expiresIn ?? '15m' },
        }),
      ],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useValue: options,
        },
        AuthService,
        LocalStrategy,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
      controllers: [AuthController],
      exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
    };
  }

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [
        ...(options.imports ?? []),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: options.imports,
          useFactory: async (...args: unknown[]) => {
            const authOptions = await options.useFactory(...args);
            return {
              secret: authOptions.jwt.secret,
              signOptions: { expiresIn: authOptions.jwt.expiresIn ?? '15m' },
            };
          },
          inject: options.inject,
        }),
      ],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        AuthService,
        LocalStrategy,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
      ],
      controllers: [AuthController],
      exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
    };
  }
}
