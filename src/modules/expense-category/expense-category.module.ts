import { Module } from '@nestjs/common';

import { BaseExpenseCategoryService } from '@Module/expense-category/base-expense-category.service';
import { ExpenseCategoryService } from '@Module/expense-category/expense-category.service';
import { TransactionModule } from '@Module/transactions/transaction.module';

@Module({
  providers: [ExpenseCategoryService, BaseExpenseCategoryService],
  imports: [TransactionModule],
  exports: [ExpenseCategoryService, BaseExpenseCategoryService],
})
export class ExpenseCategoryModule {}
