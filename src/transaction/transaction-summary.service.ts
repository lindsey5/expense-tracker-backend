import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMonthlyTransactionSummary(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    month: number,
    year: number,
  ) {
    const startOfThisMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);
    const startOfLastMonth = new Date(year, month - 2, 1);

    const [thisMonth, lastMonth] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type,
          createdAt: {
            gte: startOfThisMonth,
            lt: startOfNextMonth,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type,
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfThisMonth,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const amount = Number(thisMonth._sum.amount ?? 0);
    const previousAmount = Number(lastMonth._sum.amount ?? 0);
    const change =
      previousAmount === 0
        ? amount > 0
          ? 100
          : 0
        : ((amount - previousAmount) / previousAmount) * 100;

    return {
      amount,
      change: Number(change.toFixed(1)),
    };
  }

  async getIncome(userId: string, month: number, year: number) {
    return this.getMonthlyTransactionSummary(userId, 'INCOME', month, year);
  }

  async getExpense(userId: string, month: number, year: number) {
    return this.getMonthlyTransactionSummary(userId, 'EXPENSE', month, year);
  }
}
