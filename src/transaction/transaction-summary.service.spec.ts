import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionSummaryService } from './transaction-summary.service';

const mockPrismaService = {
  transaction: {
    aggregate: jest.fn(),
  },
};

describe('TransactionSummaryService', () => {
  let service: TransactionSummaryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionSummaryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionSummaryService>(TransactionSummaryService);
  });

  it('returns income summary with a percentage increase', async () => {
    mockPrismaService.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 1500 } })
      .mockResolvedValueOnce({ _sum: { amount: 1000 } });

    await expect(service.getIncome('user-123', 9, 2026)).resolves.toEqual({
      amount: 1500,
      change: 50,
      hasPreviousMonth: true,
    });

    expect(mockPrismaService.transaction.aggregate).toHaveBeenNthCalledWith(1, {
      where: {
        userId: 'user-123',
        type: 'INCOME',
        date: {
          gte: new Date(2026, 8, 1),
          lt: new Date(2026, 9, 1),
        },
      },
      _sum: { amount: true },
    });
    expect(mockPrismaService.transaction.aggregate).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'user-123',
        type: 'INCOME',
        date: {
          gte: new Date(2026, 7, 1),
          lt: new Date(2026, 8, 1),
        },
      },
      _sum: { amount: true },
    });
  });

  it('returns a 100% change when this month has expenses and last month has none', async () => {
    mockPrismaService.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 250 } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    await expect(service.getExpense('user-123', 9, 2026)).resolves.toEqual({
      amount: 250,
      change: 100,
      hasPreviousMonth: false,
    });
  });

  it('returns zero values when both months have no transactions', async () => {
    mockPrismaService.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    await expect(service.getIncome('user-123', 9, 2026)).resolves.toEqual({
      amount: 0,
      change: 0,
      hasPreviousMonth: false,
    });
  });

  it('loads when reflected constructor types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('src/prisma/prisma.service', () => ({
        PrismaService: undefined,
      }));

      await expect(
        import('./transaction-summary.service'),
      ).resolves.toHaveProperty('TransactionSummaryService');
    });
  });
});
