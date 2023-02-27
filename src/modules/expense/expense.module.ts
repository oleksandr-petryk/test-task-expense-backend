import { Module, forwardRef } from '@nestjs/common';

import { ExpenseController } from '@Module/expense/expense.controller';
import { ExpenseService } from '@Module/expense/expense.service';
import { TransactionService } from '@Module/transactions/transaction.service';
import { UserModule } from '@Module/user/user.module';
import { ExpenseCategoryModule } from '@Module/expense-category/expense-category.module';
import { TransactionModule } from '@Module/transactions/transaction.module';

@Module({
  providers: [ExpenseService, TransactionService],
  controllers: [ExpenseController],
  imports: [
    forwardRef(() => UserModule),
    ExpenseCategoryModule,
    TransactionModule,
  ],
  exports: [ExpenseService, TransactionService],
})
export class ExpenseModule {}
