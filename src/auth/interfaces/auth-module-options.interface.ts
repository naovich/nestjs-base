import { ModuleMetadata, Type } from '@nestjs/common';
import type { SignOptions } from 'jsonwebtoken';

export interface AuthModuleOptions {
  jwt: {
    secret: string;
    expiresIn?: SignOptions['expiresIn'];
  };
  global?: boolean;
}

export interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: unknown[]) => Promise<AuthModuleOptions> | AuthModuleOptions;
  inject?: Type[];
}
