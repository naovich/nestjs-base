import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { UserPayload } from './interfaces';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return auth response', async () => {
      const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
      const response: AuthResponseDto = {
        accessToken: 'token',
        user: { id: '1', email: 'test@example.com', roles: ['user'] },
      };
      mockAuthService.login.mockResolvedValue(response);

      const result = await controller.login(user);
      expect(result).toEqual(response);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('register', () => {
    it('should register and return auth response', async () => {
      const response: AuthResponseDto = {
        accessToken: 'token',
        user: { id: '1', email: 'new@example.com', roles: ['user'] },
      };
      mockAuthService.register.mockResolvedValue(response);

      const result = await controller.register({
        email: 'new@example.com',
        password: 'password123',
      });
      expect(result).toEqual(response);
      expect(mockAuthService.register).toHaveBeenCalledWith('new@example.com', 'password123');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user: UserPayload = { id: '1', email: 'test@example.com', roles: ['user'] };
      mockAuthService.getProfile.mockResolvedValue(user);

      const result = await controller.getProfile(user);
      expect(result).toEqual(user);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('1');
    });
  });
});
