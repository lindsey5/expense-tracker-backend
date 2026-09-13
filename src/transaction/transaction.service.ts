import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTransactionsDto } from './dto/get-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, id: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId: id,
      },
    });

    return {
      message: 'Transaction successfully created.',
      transaction,
    };
  }

  async findAll(userId: string, getTransactionsDto: GetTransactionsDto) {
    const { category, limit, month, page, type, year, search } =
      getTransactionsDto;

    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const dateWhere = {
      ...where,
      date: {
        gte: startDate,
        lt: endDate,
      },
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: dateWhere,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.transaction.count({
        where: dateWhere,
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMonths(userId: string) {
    const months = await this.prisma.$queryRaw<
      { month: number; year: number; monthName: string }[]
    >`
      SELECT DISTINCT
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        EXTRACT(YEAR FROM "createdAt")::int AS year,
        TO_CHAR("createdAt", 'Month YYYY') AS "monthName"
      FROM "Transaction"
      WHERE "userId" = ${userId}
      ORDER BY year DESC, month DESC
    `;

    if (months.length === 0) {
      const now = new Date();

      return [
        {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          monthName: now.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
        },
      ];
    }

    return months;
  }
}
