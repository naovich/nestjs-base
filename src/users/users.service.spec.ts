import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return payload', async () => {
      const user = await service.createUser('test@example.com', 'password123');
      expect(user).toEqual({
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      await service.createUser('test@example.com', 'password123');
      await expect(service.createUser('test@example.com', 'other')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should increment id for each new user', async () => {
      const user1 = await service.createUser('a@example.com', 'password123');
      const user2 = await service.createUser('b@example.com', 'password123');
      expect(user1.id).toBe('1');
      expect(user2.id).toBe('2');
    });
  });

  describe('findByEmail', () => {
    it('should return user payload when found', async () => {
      await service.createUser('test@example.com', 'password123');
      const found = await service.findByEmail('test@example.com');
      expect(found).toEqual({
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      });
    });

    it('should return null when not found', async () => {
      const found = await service.findByEmail('nonexistent@example.com');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user payload when found', async () => {
      await service.createUser('test@example.com', 'password123');
      const found = await service.findById('1');
      expect(found).toEqual({
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      });
    });

    it('should return null when not found', async () => {
      const found = await service.findById('999');
      expect(found).toBeNull();
    });
  });

  describe('validateCredentials', () => {
    it('should return user payload with valid credentials', async () => {
      await service.createUser('test@example.com', 'password123');
      const result = await service.validateCredentials('test@example.com', 'password123');
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      });
    });

    it('should return null with wrong password', async () => {
      await service.createUser('test@example.com', 'password123');
      const result = await service.validateCredentials('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      const result = await service.validateCredentials('nobody@example.com', 'password123');
      expect(result).toBeNull();
    });
  });
});
