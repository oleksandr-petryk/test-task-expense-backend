import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ExpenseModule } from '@Module/expense/expense.module';
import { UserModule } from '@Module/user/user.module';
import { PrismaModule } from '@Shared/modules/prisma/prisma.module';
import { AuthModule } from '@Src/modules/auth/auth.module';

@Module({
  controllers: [],
  providers: [],
  imports: [
    AuthModule,
    UserModule,
    ExpenseModule,
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
