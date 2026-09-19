import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionSummaryService } from './transaction-summary.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const mockTransactionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  getMonths: jest.fn(),
};

const mockTransactionSummaryService = {
  getIncome: jest.fn(),
  getExpense: jest.fn(),
};

describe('TransactionController', () => {
  let controller: TransactionController;
  const incomeType = 'INCOME' as CreateTransactionDto['type'];
  const salaryCategory = 'SALARY' as CreateTransactionDto['category'];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: TransactionSummaryService,
          useValue: mockTransactionSummaryService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('delegates create requests to TransactionService', async () => {
    const dto = {
      walletId: 'wallet-123',
      type: incomeType,
      category: salaryCategory,
      amount: 5000,
      title: 'Monthly Salary',
      date: new Date('2026-09-19T00:00:00.000Z'),
    };
    const response = {
      message: 'Transaction successfully created.',
      transaction: { id: 'transaction-123' },
    };

    mockTransactionService.create.mockResolvedValue(response);

    await expect(controller.create('user-123', dto)).resolves.toEqual(response);
    expect(mockTransactionService.create).toHaveBeenCalledWith(
      dto,
      'user-123',
    );
  });

  it('delegates list requests to TransactionService', async () => {
    const query = {
      page: 1,
      limit: 10,
      month: 9,
      year: 2026,
    };
    const response = {
      transactions: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockTransactionService.findAll.mockResolvedValue(response);

    await expect(controller.findAll('user-123', query)).resolves.toEqual(
      response,
    );
    expect(mockTransactionService.findAll).toHaveBeenCalledWith(
      'user-123',
      query,
    );
  });

  it('delegates income summary requests to TransactionSummaryService', async () => {
    const response = {
      amount: 5000,
      change: 25,
      hasPreviousMonth: true,
    };

    mockTransactionSummaryService.getIncome.mockResolvedValue(response);

    await expect(
      controller.getIncome('user-123', { month: 9, year: 2026 }),
    ).resolves.toEqual(response);
    expect(mockTransactionSummaryService.getIncome).toHaveBeenCalledWith(
      'user-123',
      9,
      2026,
    );
  });

  it('delegates expense summary requests to TransactionSummaryService', async () => {
    const response = {
      amount: 1000,
      change: -20,
      hasPreviousMonth: true,
    };

    mockTransactionSummaryService.getExpense.mockResolvedValue(response);

    await expect(
      controller.getExpense('user-123', { month: 9, year: 2026 }),
    ).resolves.toEqual(response);
    expect(mockTransactionSummaryService.getExpense).toHaveBeenCalledWith(
      'user-123',
      9,
      2026,
    );
  });

  it('delegates month list requests to TransactionService', async () => {
    const response = [
      {
        month: 9,
        year: 2026,
        monthName: 'September 2026',
      },
    ];

    mockTransactionService.getMonths.mockResolvedValue(response);

    await expect(controller.getMonths('user-123')).resolves.toEqual(response);
    expect(mockTransactionService.getMonths).toHaveBeenCalledWith('user-123');
  });
});
