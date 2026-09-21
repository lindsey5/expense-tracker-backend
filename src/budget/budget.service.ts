import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BudgetStatus, GetBudgetsQueryDto } from './dto/get-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const { category, amount, month, year } = dto;

    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month,
          year,
        },
      },
    });

    if (existingBudget) {
      throw new ConflictException(
        'A budget for this category already exists for this month.',
      );
    }

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        category,
        amount,
        month,
        year,
      },
    });

    return {
      message: 'Budget successfully created.',
      budget,
    };
  }

  async findAll(userId: string, query: GetBudgetsQueryDto) {
    const { month, year, status } = query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const budgets = await this.prisma.$queryRaw<any[]>`
      SELECT
        b.id,
        b."userId",
        b.category,
        b.amount,
        b.month,
        b.year,
        b."createdAt",
        b."updatedAt",

        COALESCE(SUM(t.amount), 0) AS spent

      FROM "Budget" b

      LEFT JOIN "Transaction" t
        ON t."userId" = b."userId"
        AND t.category = b.category
        AND t.type = 'EXPENSE'
        AND t.date >= ${startDate}
        AND t.date < ${endDate}

      WHERE b."userId" = ${userId}
        AND b.month = ${month}
        AND b.year = ${year}

      GROUP BY
        b.id,
        b."userId",
        b.category,
        b.amount,
        b.month,
        b.year,
        b."createdAt",
        b."updatedAt"

      ORDER BY b.category
    `;

    const result = budgets
      .map((budget) => {
        const amount = Number(budget.amount);
        const spent = Number(budget.spent);

        const remaining = amount - spent;
        const percentage = amount > 0 ? (spent / amount) * 100 : 0;

        const budgetStatus: BudgetStatus =
          percentage > 100
            ? BudgetStatus.EXCEEDED
            : percentage >= 80
              ? BudgetStatus.WARNING
              : BudgetStatus.ON_TRACK;

        return {
          ...budget,
          amount,
          spent,
          remaining,
          percentage: Number(percentage.toFixed(2)),
          status: budgetStatus,
        };
      })
      .filter((budget) => !status || budget.status === status);

    return {
      budgets: result,
    };
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found.');
    }

    if (budget.userId !== userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });

    return {
      message: 'Budget successfully updated.',
      budget: updatedBudget,
    };
  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found.');
    }

    await this.prisma.budget.delete({ where: { id } });

    return { message: 'Budget successfully removed.' };
  }

  async getMonths(userId: string) {
    const months = await this.prisma.$queryRaw<
      { month: number; year: number; monthName: string }[]
    >`
      SELECT DISTINCT
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        EXTRACT(YEAR FROM "createdAt")::int AS year,
        TO_CHAR("createdAt", 'FMMonth YYYY') AS "monthName"
      FROM "Budget"
      WHERE "userId" = ${userId}
      ORDER BY year DESC, month DESC
    `;

    const now = new Date();

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const hasCurrentMonth = months.some(
      ({ month, year }) => month === currentMonth && year === currentYear,
    );

    if (!hasCurrentMonth) {
      months.unshift({
        month: currentMonth,
        year: currentYear,
        monthName: now.toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      });
    }

    return months;
  }

  async monthlyBudget(
    userId: string,
    month?: number,
    year?: number,
  ) {
    const now = new Date();

    const selectedMonth = month ?? now.getMonth() + 1;
    const selectedYear = year ?? now.getFullYear();

    const monthlyBudget = await this.prisma.budget.aggregate({
      where: {
        userId,
        month: selectedMonth,
        year: selectedYear,
      },
      _sum: {
        amount: true,
      },
    });

    const expenses = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: new Date(selectedYear, selectedMonth - 1, 1),
          lt: new Date(selectedYear, selectedMonth, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalBudget = monthlyBudget._sum.amount ?? 0;
    const spending = expenses._sum.amount ?? 0;
    const remaining = totalBudget - spending;

    const percentage =
      totalBudget > 0
        ? (spending / totalBudget) * 100
        : 0;

    return {
      month: selectedMonth,
      year: selectedYear,
      totalBudget,
      spending,
      remaining,
      percentage,
    };
  }
}
