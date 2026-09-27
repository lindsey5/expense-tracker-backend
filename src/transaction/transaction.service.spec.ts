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
    delete: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
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
      date: '2026-09-19',
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
        date: '2026-09-19',
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

    it('throws when an expense exceeds the wallet balance', async () => {
      const expenseDto = {
        walletId: 'wallet-123',
        type: expenseType,
        category: foodCategory,
        amount: 11000,
        title: 'Laptop',
        date: '2026-09-19',
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue({
        id: 'wallet-123',
        balance: 10000,
        userId: 'user-123',
      });

      await expect(service.create(expenseDto, 'user-123')).rejects.toThrow(
        'Insufficient wallet balance.',
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
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
        orderBy: [
          {
            date: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
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
        orderBy: [
          {
            date: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
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

  describe('getRecent', () => {
    it('returns the five most recent transactions ordered by date and creation time', async () => {
      const transactions = [
        {
          id: 'transaction-123',
          title: 'Dinner',
          amount: 1000,
          wallet: { id: 'wallet-123' },
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(transactions);

      await expect(service.getRecent('user-123')).resolves.toEqual(
        transactions,
      );
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        take: 5,
        orderBy: [
          {
            date: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        include: {
          wallet: true,
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

  describe('delete', () => {
    it('throws when the transaction does not exist for the user', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.delete('user-123', 'transaction-123'),
      ).rejects.toThrow('Transaction not found');

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          id: 'transaction-123',
        },
      });
      expect(mockPrismaService.wallet.update).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.delete).not.toHaveBeenCalled();
    });

    it('deletes an expense transaction and restores the wallet balance', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue({
        id: 'transaction-123',
        walletId: 'wallet-123',
        type: expenseType,
        amount: 1000,
      });
      mockPrismaService.wallet.update.mockResolvedValue({ id: 'wallet-123' });
      mockPrismaService.transaction.delete.mockResolvedValue({
        id: 'transaction-123',
      });

      await expect(
        service.delete('user-123', 'transaction-123'),
      ).resolves.toEqual({
        message: 'Transaction succcessfully deleted.',
      });

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: 'wallet-123',
        },
        data: {
          balance: {
            increment: 1000,
          },
        },
      });
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: {
          id: 'transaction-123',
        },
      });
    });

    it('deletes an income transaction and removes it from the wallet balance', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue({
        id: 'transaction-123',
        walletId: 'wallet-123',
        type: incomeType,
        amount: 5000,
      });
      mockPrismaService.wallet.update.mockResolvedValue({ id: 'wallet-123' });
      mockPrismaService.transaction.delete.mockResolvedValue({
        id: 'transaction-123',
      });

      await service.delete('user-123', 'transaction-123');

      expect(mockPrismaService.wallet.update).toHaveBeenCalledWith({
        where: {
          id: 'wallet-123',
        },
        data: {
          balance: {
            increment: -5000,
          },
        },
      });
    });
  });

  describe('update', () => {
    it('throws when the transaction does not exist for the user', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.update('transaction-123', 1500, 'user-123'),
      ).rejects.toThrow('Transaction not found');

      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'transaction-123',
          userId: 'user-123',
        },
      });
      expect(mockPrismaService.transaction.update).not.toHaveBeenCalled();
    });

    it('updates the transaction amount', async () => {
      const updatedTransaction = {
        id: 'transaction-123',
        amount: 1500,
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue({
        id: 'transaction-123',
        amount: 1000,
      });
      mockPrismaService.transaction.update.mockResolvedValue(
        updatedTransaction,
      );

      await expect(
        service.update('transaction-123', 1500, 'user-123'),
      ).resolves.toEqual({
        transaction: updatedTransaction,
        message: 'Transaction successfully updated.',
      });

      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: {
          id: 'transaction-123',
        },
        data: {
          amount: 1500,
        },
      });
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
