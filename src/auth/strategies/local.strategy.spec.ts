import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { USER_PROVIDER } from '../constants/auth.constants';
import type { UserPayload } from '../interfaces';
import { LocalStrategy } from './local.strategy';

const mockUserProvider = {
  validateCredentials: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: USER_PROVIDER, useValue: mockUserProvider }],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user when credentials are valid', async () => {
    const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
    mockUserProvider.validateCredentials.mockResolvedValue(user);

    const result = await strategy.validate('test@example.com', 'password123');
    expect(result).toEqual(user);
  });

  it('should throw UnauthorizedException when credentials are invalid', async () => {
    mockUserProvider.validateCredentials.mockResolvedValue(null);

    await expect(strategy.validate('test@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
