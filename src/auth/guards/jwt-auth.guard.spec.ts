import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should delegate to parent canActivate when route is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const parentCanActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(parentCanActivate).toHaveBeenCalledWith(context);

    parentCanActivate.mockRestore();
  });

  it('should delegate to parent and return false when unauthenticated', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const parentCanActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(false);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);
    expect(result).toBe(false);

    parentCanActivate.mockRestore();
  });
});
