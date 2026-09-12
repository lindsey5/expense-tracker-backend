import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTransactionsDto } from './dto/get-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, id: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        userId: id
      }
    })

    return {
      message: "Transaction successfully created.",
      transaction
    }
  }

  async findAll(userId: string, getTransactionsDto: GetTransactionsDto) {
    const { category, limit, month, page, type, year } = getTransactionsDto;
    const skip = (page - 1) * limit;

    const where : any = { userId };

    if(type){
      where.type = type;
    }

    if(category) {
      where.category = category;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          ...where,
          date: {
            gte: startDate,
            lt: endDate
          }
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      this.prisma.transaction.count({ where })
    ])

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
