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
          date: {
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
          date: {
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
      hasPreviousMonth: previousAmount > 0,
    };
  }

  async getIncome(userId: string, month: number, year: number) {
    return this.getMonthlyTransactionSummary(userId, 'INCOME', month, year);
  }

  async getExpense(userId: string, month: number, year: number) {
    return this.getMonthlyTransactionSummary(userId, 'EXPENSE', month, year);
  }

  async getMonthlyTransaction(year: number, userId: string) {
    type MonthlyTransactionRow = {
      month: number;
      type: 'INCOME' | 'EXPENSE';
      total: number | string;
    };

    const result = await this.prisma.$queryRaw<MonthlyTransactionRow[]>`
      SELECT
        EXTRACT(MONTH FROM date)::int AS month,
        type,
        SUM(amount) AS total
      FROM "Transaction"
      WHERE
        "userId" = ${userId}
        AND date >= ${new Date(`${year}-01-01`)}
        AND date < ${new Date(`${year + 1}-01-01`)}
      GROUP BY
        EXTRACT(MONTH FROM date),
        type
      ORDER BY month;
    `;

    const monthly:{ income: number; expense: number; month: number } [] = [];

    for (const row of result) {
      let item = monthly.find((month) => month.month === row.month);

      if (!item) {
        item = {
          month: row.month,
          income: 0,
          expense: 0,
        };

        monthly.push(item);
      }

      if (row.type === "INCOME") {
        item.income += Number(row.total);
      } else {
        item.expense += Number(row.total);
      }
    }

    return monthly;
  }
}
