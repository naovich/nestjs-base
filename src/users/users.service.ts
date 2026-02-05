import { ConflictException, Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcryptjs';

import { UserPayload, UserProviderInterface } from '../auth/interfaces';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService implements UserProviderInterface {
  private readonly users: User[] = [];
  private idCounter = 0;

  async findByEmail(email: string): Promise<UserPayload | null> {
    const user = this.users.find((u) => u.email === email);
    return user ? this.toPayload(user) : null;
  }

  async findById(id: string): Promise<UserPayload | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? this.toPayload(user) : null;
  }

  async validateCredentials(email: string, password: string): Promise<UserPayload | null> {
    const user = this.users.find((u) => u.email === email);
    if (!user) {
      return null;
    }
    const isValid = compareSync(password, user.passwordHash);
    return isValid ? this.toPayload(user) : null;
  }

  async createUser(email: string, password: string): Promise<UserPayload> {
    const existing = this.users.find((u) => u.email === email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    this.idCounter += 1;
    const user: User = {
      id: String(this.idCounter),
      email,
      passwordHash: hashSync(password, 10),
      roles: ['user'],
    };

    this.users.push(user);
    return this.toPayload(user);
  }

  private toPayload(user: User): UserPayload {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
}
