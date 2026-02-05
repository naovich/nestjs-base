import { UserPayload } from './user-payload.interface';

export interface UserProviderInterface {
  findByEmail(email: string): Promise<UserPayload | null>;
  findById(id: string): Promise<UserPayload | null>;
  validateCredentials(email: string, password: string): Promise<UserPayload | null>;
  createUser(email: string, password: string): Promise<UserPayload>;
}
