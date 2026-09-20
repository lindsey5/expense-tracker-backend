import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const mockPrismaService = {
  wallet: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(
    (
      callback: (tx: {
        transaction: typeof mockPrismaService.transaction;
        wallet: typeof mockPrismaService.wallet;
      }) => unknown,
    ) => {
      return callback({
        transaction: mockPrismaService.transaction,
        wallet: mockPrismaService.wallet,
      });
    },
  ),
  $queryRaw: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;
  const incomeType = 'INCOME' as CreateTransactionDto['type'];
  const expenseType = 'EXPENSE' as CreateTransactionDto['type'];
  const salaryCategory = 'SALARY' as CreateTransactionDto['category'];
  const foodCategory = 'FOOD' as CreateTransactionDto['category'];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    const createTransactionDto = {
      walletId: 'wallet-123',
      type: incomeType,
      category: salaryCategory,
      amount: 5000,
      title: 'Monthly Salary',
      date: new Date('2026-09-19T10:30:00.000Z'),
    };

    it('throws when the wallet does not exist for the user', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createTransactionDto, 'user-123'),
      ).rejects.toThrow('Wallet not found');

      expect(mockPrismaService.wallet.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'wallet-123',
          userId: 'user-123',
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
    });

    it('creates an income transaction and increases the wallet balance', async () => {
      const wallet = {
        id: 'wallet-123',
        balance: 10000,
        userId: 'user-123',
      };
      const createdTransaction = {
        id: 'transaction-123',
        ...createTransactionDto,
        date: new Date('2026-09-19T00:00:00.000Z'),
        userId: 'user-123',
        wallet,
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue(wallet);
      mockPrismaService.transaction.create.mockResolvedValue(
        createdTransaction,
      );
      mockPrismaService.wallet.update.mockResolvedValue({
        ...wallet,
        balance: 15000,
      });

      const result = await service.create(createTransactionDto, 'user-123');

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          walletId: 'wallet-123',
          type: 'INCOME',
          category: 'SALARY',
          amount: 5000,
          title: 'Monthly Salary',
          date: new Date('2026-09-19T00:00:00.000Z'),
          userId: 'user-123',
        },
        include: {
          wallet: true,
        },
      });
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: 'wallet-123',
        },
        data: {
          balance: {
            increment: 5000,
          },
        },
      });
      expect(result).toEqual({
        message: 'Transaction successfully created.',
        transaction: createdTransaction,
      });
    });

    it('creates an expense transaction and decreases the wallet balance', async () => {
      const expenseDto = {
        walletId: 'wallet-123',
        type: expenseType,
        category: foodCategory,
        amount: 1000,
        title: 'Dinner',
        date: new Date('2026-09-19T10:30:00.000Z'),
      };
      const wallet = {
        id: 'wallet-123',
        balance: 10000,
        userId: 'user-123',
      };
      const createdTransaction = {
        id: 'transaction-456',
        ...expenseDto,
        date: new Date('2026-09-19T00:00:00.000Z'),
        userId: 'user-123',
        wallet,
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue(wallet);
      mockPrismaService.transaction.create.mockResolvedValue(
        createdTransaction,
      );
      mockPrismaService.wallet.update.mockResolvedValue({
        ...wallet,
        balance: 9000,
      });

      const result = await service.create(expenseDto, 'user-123');

      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          walletId: 'wallet-123',
          type: 'EXPENSE',
          category: 'FOOD',
          amount: 1000,
          title: 'Dinner',
          date: new Date('2026-09-19T00:00:00.000Z'),
          userId: 'user-123',
        },
        include: {
          wallet: true,
        },
      });
      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: 'wallet-123',
        },
        data: {
          balance: {
            increment: -1000,
          },
        },
      });
      expect(result).toEqual({
        message: 'Transaction successfully created.',
        transaction: createdTransaction,
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated transactions without optional filters', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      const result = await service.findAll('user-123', {
        page: 1,
        limit: 10,
        month: 9,
        year: 2026,
      });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          date: {
            gte: new Date(2026, 8, 1),
            lt: new Date(2026, 9, 1),
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          wallet: true,
        },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
      });
      expect(result).toEqual({
        transactions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('returns paginated transactions with filters and search', async () => {
      const transactions = [
        {
          id: 'transaction-123',
          title: 'Dinner',
          amount: 1000,
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);
      mockPrismaService.transaction.count.mockResolvedValue(25);

      const result = await service.findAll('user-123', {
        page: 2,
        limit: 10,
        month: 9,
        year: 2026,
        type: expenseType,
        category: foodCategory,
        search: 'din',
      });

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          type: 'EXPENSE',
          category: 'FOOD',
          title: {
            contains: 'din',
            mode: 'insensitive',
          },
          date: {
            gte: new Date(2026, 8, 1),
            lt: new Date(2026, 9, 1),
          },
        },
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          wallet: true,
        },
      });
      expect(mockPrismaService.transaction.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          type: 'EXPENSE',
          category: 'FOOD',
          title: {
            contains: 'din',
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual({
        transactions,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });
  });

  describe('getMonths', () => {
    it('returns months from the raw query when transactions exist', async () => {
      const months = [
        {
          month: 9,
          year: 2026,
          monthName: 'September 2026',
        },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(months);

      await expect(service.getMonths('user-123')).resolves.toEqual(months);
    });

    it('returns the current month when the user has no transactions', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-19T00:00:00.000Z'));
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await expect(service.getMonths('user-123')).resolves.toEqual([
        {
          month: 9,
          year: 2026,
          monthName: 'September 2026',
        },
      ]);

      jest.useRealTimers();
    });
  });

  it('loads when reflected constructor types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('src/prisma/prisma.service', () => ({
        PrismaService: undefined,
      }));
      jest.unstable_mockModule('./dto/create-transaction.dto', () => ({
        CreateTransactionDto: undefined,
      }));
      jest.unstable_mockModule('./dto/get-transaction.dto', () => ({
        GetTransactionsDto: undefined,
      }));

      await expect(import('./transaction.service')).resolves.toHaveProperty(
        'TransactionService',
      );
    });
  });
});
