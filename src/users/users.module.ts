import { Module } from '@nestjs/common';

import { USER_PROVIDER } from '../auth/constants/auth.constants';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    {
      provide: USER_PROVIDER,
      useExisting: UsersService,
    },
  ],
  exports: [USER_PROVIDER, UsersService],
})
export class UsersModule {}
