import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTransactionsDto } from './dto/get-transaction.dto';

type TransactionListWhere = {
  userId: string;
  type?: GetTransactionsDto['type'];
  category?: GetTransactionsDto['category'];
  title?: {
    contains: string;
    mode: 'insensitive';
  };
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, id: string) {
    const { date, ...data } = createTransactionDto;

    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: data.walletId,
        userId: id,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          ...data,
          date: new Date(
            Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
            ),
          ),
          userId: id,
        },
        include: {
          wallet: true,
        },
      });

      const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;

      await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return transaction;
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

    const where: TransactionListWhere = { userId };

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

    const finalWhere = {
      ...where,
      date: {
        gte: startDate,
        lt: endDate,
      },
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: finalWhere,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          wallet: true,
        },
      }),
      this.prisma.transaction.count({
        where,
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

  async getRecent(userId: string) {
    const transaction = await this.prisma.transaction.findMany({
      where: { userId },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        wallet: true,
      },
    });

    return transaction;
  }
}
