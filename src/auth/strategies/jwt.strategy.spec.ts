import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AUTH_MODULE_OPTIONS, USER_PROVIDER } from '../constants/auth.constants';
import type { JwtPayload, UserPayload } from '../interfaces';
import { JwtStrategy } from './jwt.strategy';

const mockUserProvider = {
  findById: jest.fn(),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: USER_PROVIDER, useValue: mockUserProvider },
        {
          provide: AUTH_MODULE_OPTIONS,
          useValue: { jwt: { secret: 'test-secret', expiresIn: '15m' } },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user when token payload is valid', async () => {
    const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
    mockUserProvider.findById.mockResolvedValue(user);

    const payload: JwtPayload = { sub: '1', email: 'test@example.com', roles: ['user'] };
    const result = await strategy.validate(payload);
    expect(result).toEqual(user);
    expect(mockUserProvider.findById).toHaveBeenCalledWith('1');
  });

  it('should throw UnauthorizedException when user not found', async () => {
    mockUserProvider.findById.mockResolvedValue(null);

    const payload: JwtPayload = { sub: '999', email: 'gone@example.com', roles: [] };
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
