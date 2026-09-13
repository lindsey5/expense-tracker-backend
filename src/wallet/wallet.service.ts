import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  
  async create(userId: string, createWalletDto: CreateWalletDto) {
    const isExisting = await this.prisma.wallet.findFirst({
      where: {
        name: createWalletDto.name
      }
    })

    if(isExisting) {
      throw new ConflictException("Wallet name already exists.");
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        ...createWalletDto
      }
    })

    return {
      wallet,
      message: "Wallet successfully added"
    }
  }

  async findAll(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: {
        userId
      }
    })
    
    return { wallets };
  }

  async getTotalBalance(userId: string) {
    const [totalWallets, result] = await Promise.all([
      this.prisma.wallet.count({ where: { userId }}),
      this.prisma.wallet.aggregate({
        where: { userId },
        _sum: {
          balance: true,
        },
      }),
    ]);

    const totalBalance = result._sum.balance;

    return {
      totalWallets,
      totalBalance,
    };
  }

  async update(id: string, updateWalletDto: UpdateWalletDto) {
      const wallet = await this.prisma.wallet.findUnique({
          where: { id },
      });

      if (!wallet) {
          throw new NotFoundException('Wallet not found');
      }

      const updatedWallet = await this.prisma.wallet.update({
          where: { id },
          data: updateWalletDto,
      });

      return {
          wallet: updatedWallet,
          message: 'Wallet updated successfully',
      };
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
