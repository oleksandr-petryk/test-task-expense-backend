import { Module } from '@nestjs/common';

import { TransactionService } from '@Module/transactions/transaction.service';

@Module({
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
