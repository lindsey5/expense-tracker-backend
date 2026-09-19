import { Module } from '@nestjs/common';

import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionSummaryService } from './transaction-summary.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    PrismaService,
    TransactionSummaryService,
  ],
})
export class TransactionModule {}