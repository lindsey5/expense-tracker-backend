import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BudgetStatus, GetBudgetQueryDto } from './dto/get-budget.dto';

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

    return this.prisma.budget.create({
      data: {
        userId,
        category,
        amount,
        month,
        year,
      },
    });
  }

  async findAll(
      userId: string,
      query: GetBudgetQueryDto
  ) {
      const { month, year, status } = query;
      const budgets = await this.prisma.budget.findMany({
          where: {
              userId,
              month,
              year,
          },
      });

      if (budgets.length === 0) {
          return [];
      }

      const categories = budgets.map((budget) => budget.category);

      const expenses = await this.prisma.transaction.groupBy({
          by: ['category'],
          where: {
              userId,
              type: 'EXPENSE',
              category: {
                  in: categories,
              },
              date: {
                  gte: new Date(year, month - 1, 1),
                  lt: new Date(year, month, 1),
              },
          },
          _sum: {
              amount: true,
          },
      });

      const expenseMap = new Map(
          expenses.map((expense) => [
              expense.category,
              Number(expense._sum.amount ?? 0),
          ]),
      );

      const result = budgets.map((budget) => {
          const amount = Number(budget.amount);
          const spent = expenseMap.get(budget.category) ?? 0;
          const remaining = amount - spent;
          const percentage = amount > 0
              ? (spent / amount) * 100
              : 0;

          const budgetStatus: BudgetStatus =
              percentage > 100
                  ? ('EXCEEDED' as unknown as BudgetStatus)
                  : percentage >= 80
                      ? ('WARNING' as unknown as BudgetStatus)
                      : ('ON_TRACK' as unknown as BudgetStatus);

          return {
              ...budget,
              amount,
              spent,
              remaining,
              percentage: Number(percentage.toFixed(2)),
              status: budgetStatus,
          };
      });

      if (status) {
          return result.filter((budget) => budget.status === status);
      }

      return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget.`;
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findUnique({
      where: { id }
    });

    if(!budget) {
      throw new NotFoundException("Budget not found."); 
    }

    if(budget.userId !== userId) {
      throw new UnauthorizedException('Unauthorized.');
    }

    const updatedBudget = await this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto
    })

    return {
      message: "Budget successfully updated.",
      budget: updatedBudget
    }

  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id, userId }
    });

    if(!budget) {
      throw new NotFoundException("Budget not found."); 
    }

    await this.prisma.budget.delete({ where: { id }});

    return { message: "Budget successfully removed."}
  }
}
