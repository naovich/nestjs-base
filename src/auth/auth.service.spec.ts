import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { USER_PROVIDER } from './constants/auth.constants';
import type { UserPayload, UserProviderInterface } from './interfaces';

const mockUserProvider: UserProviderInterface = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  validateCredentials: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_PROVIDER, useValue: mockUserProvider },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
      const result = await service.login(user);

      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: { id: '1', email: 'test@example.com', roles: ['user'] },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        roles: ['user'],
      });
    });
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      const newUser: UserPayload = { id: '1', email: 'new@example.com', roles: ['user'] };
      (mockUserProvider.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserProvider.createUser as jest.Mock).mockResolvedValue(newUser);

      const result = await service.register('new@example.com', 'password123');

      expect(mockUserProvider.createUser).toHaveBeenCalledWith('new@example.com', 'password123');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('new@example.com');
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser: UserPayload = { id: '1', email: 'exists@example.com', roles: ['user'] };
      (mockUserProvider.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(service.register('exists@example.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
      (mockUserProvider.validateCredentials as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      (mockUserProvider.validateCredentials as jest.Mock).mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
      (mockUserProvider.findById as jest.Mock).mockResolvedValue(user);

      const result = await service.getProfile('1');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (mockUserProvider.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('999')).rejects.toThrow(UnauthorizedException);
    });
  });
});
