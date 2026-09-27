import { jest } from '@jest/globals';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionSummaryService } from './transaction-summary.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const mockTransactionService = {
  create: jest.fn(),
  findAll: jest.fn(),
  getRecent: jest.fn(),
  getMonths: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockTransactionSummaryService = {
  getIncome: jest.fn(),
  getExpense: jest.fn(),
};

describe('TransactionController', () => {
  let controller: TransactionController;

  const incomeType = 'INCOME' as CreateTransactionDto['type'];
  const salaryCategory = 'SALARY' as CreateTransactionDto['category'];

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new TransactionController(
      mockTransactionService as unknown as TransactionService,
      mockTransactionSummaryService as unknown as TransactionSummaryService,
    );
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

    expect(mockTransactionService.create).toHaveBeenCalledWith(dto, 'user-123');
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
      controller.getIncome('user-123', {
        month: 9,
        year: 2026,
      }),
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
      controller.getExpense('user-123', {
        month: 9,
        year: 2026,
      }),
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

  it('delegates recent transaction requests to TransactionService', async () => {
    const response = [
      {
        id: 'transaction-123',
        title: 'Dinner',
      },
    ];

    mockTransactionService.getRecent.mockResolvedValue(response);

    await expect(controller.getRecent('user-123')).resolves.toEqual(response);

    expect(mockTransactionService.getRecent).toHaveBeenCalledWith('user-123');
  });

  it('delegates update requests to TransactionService', async () => {
    const response = {
      message: 'Transaction successfully updated.',
      transaction: {
        id: 'transaction-123',
        amount: 1500,
      },
    };

    mockTransactionService.update.mockResolvedValue(response);

    await expect(
      controller.update('user-123', 'transaction-123', { amount: 1500 }),
    ).resolves.toEqual(response);

    expect(mockTransactionService.update).toHaveBeenCalledWith(
      'transaction-123',
      1500,
      'user-123',
    );
  });

  it('delegates delete requests to TransactionService', async () => {
    const response = {
      message: 'Transaction succcessfully deleted.',
    };

    mockTransactionService.delete.mockResolvedValue(response);

    await expect(
      controller.delete('user-123', 'transaction-123'),
    ).resolves.toEqual(response);

    expect(mockTransactionService.delete).toHaveBeenCalledWith(
      'user-123',
      'transaction-123',
    );
  });

  it('loads when reflected decorator types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('./transaction.service', () => ({
        TransactionService: undefined,
      }));
      jest.unstable_mockModule('./transaction-summary.service', () => ({
        TransactionSummaryService: undefined,
      }));
      jest.unstable_mockModule('./dto/create-transaction.dto', () => ({
        CreateTransactionDto: undefined,
        CreateTransactionResponse: undefined,
      }));
      jest.unstable_mockModule('./dto/get-transaction.dto', () => ({
        GetTransactionsDto: undefined,
        GetTransactionsResponseDto: undefined,
      }));
      jest.unstable_mockModule('./dto/transaction.dto', () => ({
        CreateUpdateTransactionResponse: undefined,
        GetTransactionMonths: undefined,
        TransactionResponseDto: undefined,
      }));
      jest.unstable_mockModule('./dto/transaction-summary.dto', () => ({
        GetExpensesResponseDto: undefined,
        GetIncomesResponseDto: undefined,
      }));
      jest.unstable_mockModule('./dto/delete-transaction.dto', () => ({
        DeleteTransactionResponse: undefined,
      }));
      jest.unstable_mockModule('./dto/update-transaction.dto', () => ({
        UpdateTransactionDto: undefined,
        UpdateTransactionResponse: undefined,
      }));
      jest.unstable_mockModule('src/dto/common.dto', () => ({
        DateFilter: undefined,
      }));
      jest.unstable_mockModule('src/common/dto/month.dto', () => ({
        GetMonths: undefined,
      }));

      await expect(import('./transaction.controller')).resolves.toHaveProperty(
        'TransactionController',
      );
    });
  });
});
