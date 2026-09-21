import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaService } from 'src/prisma/prisma.service';
import { BudgetService } from './budget.service';
import { BudgetStatus } from './dto/get-budget.dto';

const mockPrismaService = {
  budget: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  transaction: {
    aggregate: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  it('throws when a budget already exists for the same category, month and year', async () => {
    mockPrismaService.budget.findUnique.mockResolvedValue({
      id: 'budget-123',
      userId: 'user-123',
      category: 'FOOD',
      month: 9,
      year: 2026,
    });

    await expect(
      service.create('user-123', {
        category: 'FOOD',
        amount: 2500,
        month: 9,
        year: 2026,
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockPrismaService.budget.findUnique).toHaveBeenCalledWith({
      where: {
        userId_category_month_year: {
          userId: 'user-123',
          category: 'FOOD',
          month: 9,
          year: 2026,
        },
      },
    });
    expect(mockPrismaService.budget.create).not.toHaveBeenCalled();
  });

  it('creates a budget successfully', async () => {
    const createdBudget = {
      id: 'budget-123',
      userId: 'user-123',
      category: 'FOOD',
      amount: 2500,
      month: 9,
      year: 2026,
      createdAt: new Date('2026-09-01T00:00:00.000Z'),
      updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    };

    mockPrismaService.budget.findUnique.mockResolvedValue(null);
    mockPrismaService.budget.create.mockResolvedValue(createdBudget);

    await expect(
      service.create('user-123', {
        category: 'FOOD',
        amount: 2500,
        month: 9,
        year: 2026,
      }),
    ).resolves.toEqual({
      message: 'Budget successfully created.',
      budget: createdBudget,
    });

    expect(mockPrismaService.budget.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        category: 'FOOD',
        amount: 2500,
        month: 9,
        year: 2026,
      },
    });
  });

  it('returns monthly budgets with the matching status filter', async () => {
    mockPrismaService.$queryRaw.mockResolvedValue([
      {
        id: 'budget-1',
        userId: 'user-123',
        category: 'FOOD',
        amount: '5000',
        spent: '3000',
        month: 9,
        year: 2026,
        createdAt: new Date('2026-09-01T00:00:00.000Z'),
        updatedAt: new Date('2026-09-01T00:00:00.000Z'),
      },
      {
        id: 'budget-2',
        userId: 'user-123',
        category: 'TRANSPORT',
        amount: '2000',
        spent: '1800',
        month: 9,
        year: 2026,
        createdAt: new Date('2026-09-01T00:00:00.000Z'),
        updatedAt: new Date('2026-09-01T00:00:00.000Z'),
      },
    ]);

    const result = await service.findAll('user-123', {
      month: 9,
      year: 2026,
      status: BudgetStatus.WARNING,
    });

    expect(result).toEqual({
      budgets: [
        {
          id: 'budget-2',
          userId: 'user-123',
          category: 'TRANSPORT',
          amount: 2000,
          spent: 1800,
          remaining: 200,
          percentage: 90,
          status: BudgetStatus.WARNING,
          month: 9,
          year: 2026,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    });
  });

  it('classifies budgets into on track, warning and exceeded states without a status filter', async () => {
    mockPrismaService.$queryRaw.mockResolvedValue([
      { id: 'budget-1', userId: 'user-123', category: 'FOOD', amount: '1000', spent: '1200', month: 9, year: 2026, createdAt: new Date(), updatedAt: new Date() },
      { id: 'budget-2', userId: 'user-123', category: 'TRANSPORT', amount: '1000', spent: '900', month: 9, year: 2026, createdAt: new Date(), updatedAt: new Date() },
      { id: 'budget-3', userId: 'user-123', category: 'BILLS', amount: '1000', spent: '300', month: 9, year: 2026, createdAt: new Date(), updatedAt: new Date() },
    ]);

    await expect(service.findAll('user-123', { month: 9, year: 2026 })).resolves.toEqual({
      budgets: [
        {
          id: 'budget-1',
          userId: 'user-123',
          category: 'FOOD',
          amount: 1000,
          spent: 1200,
          remaining: -200,
          percentage: 120,
          status: BudgetStatus.EXCEEDED,
          month: 9,
          year: 2026,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 'budget-2',
          userId: 'user-123',
          category: 'TRANSPORT',
          amount: 1000,
          spent: 900,
          remaining: 100,
          percentage: 90,
          status: BudgetStatus.WARNING,
          month: 9,
          year: 2026,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 'budget-3',
          userId: 'user-123',
          category: 'BILLS',
          amount: 1000,
          spent: 300,
          remaining: 700,
          percentage: 30,
          status: BudgetStatus.ON_TRACK,
          month: 9,
          year: 2026,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ],
    });
  });

  it('returns the current month when budgets already include it', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-19T00:00:00.000Z'));
    mockPrismaService.$queryRaw.mockResolvedValue([
      { month: 9, year: 2026, monthName: 'September 2026' },
    ]);

    await expect(service.getMonths('user-123')).resolves.toEqual([
      { month: 9, year: 2026, monthName: 'September 2026' },
    ]);

    jest.useRealTimers();
  });

  it('adds the current month when the user has no budget entries yet', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-19T00:00:00.000Z'));
    mockPrismaService.$queryRaw.mockResolvedValue([]);

    await expect(service.getMonths('user-123')).resolves.toEqual([
      { month: 9, year: 2026, monthName: 'September 2026' },
    ]);

    jest.useRealTimers();
  });

  it('returns zero percentage when no budget exists for the selected month', async () => {
    mockPrismaService.budget.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
    });
    mockPrismaService.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
    });

    await expect(service.monthlyBudget('user-123', 9, 2026)).resolves.toEqual({
      month: 9,
      year: 2026,
      totalBudget: 0,
      spending: 0,
      remaining: 0,
      percentage: 0,
    });
  });

  it('updates a budget successfully when it belongs to the user', async () => {
    mockPrismaService.budget.findUnique.mockResolvedValue({
      id: 'budget-123',
      userId: 'user-123',
    });
    mockPrismaService.budget.update.mockResolvedValue({
      id: 'budget-123',
      userId: 'user-123',
      amount: 4500,
    });

    await expect(
      service.update('budget-123', 'user-123', {
        amount: 4500,
      }),
    ).resolves.toEqual({
      message: 'Budget successfully updated.',
      budget: {
        id: 'budget-123',
        userId: 'user-123',
        amount: 4500,
      },
    });
  });

  it('removes a budget successfully when it belongs to the user', async () => {
    mockPrismaService.budget.findUnique.mockResolvedValue({
      id: 'budget-123',
      userId: 'user-123',
    });

    await expect(service.remove('budget-123', 'user-123')).resolves.toEqual({
      message: 'Budget successfully removed.',
    });
    expect(mockPrismaService.budget.delete).toHaveBeenCalledWith({
      where: { id: 'budget-123' },
    });
  });

  it('throws when trying to update a budget that does not belong to the user', async () => {
    mockPrismaService.budget.findUnique.mockResolvedValue({
      id: 'budget-123',
      userId: 'other-user',
    });

    await expect(
      service.update('budget-123', 'user-123', {
        amount: 4500,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when removing a non-existent budget', async () => {
    mockPrismaService.budget.findUnique.mockResolvedValue(null);

    await expect(service.remove('budget-123', 'user-123')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('loads when reflected constructor types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('src/prisma/prisma.service', () => ({
        PrismaService: undefined,
      }));
      jest.unstable_mockModule('./dto/create-budget.dto', () => ({
        CreateBudgetDto: undefined,
      }));
      jest.unstable_mockModule('./dto/update-budget.dto', () => ({
        UpdateBudgetDto: undefined,
      }));
      jest.unstable_mockModule('./dto/get-budget.dto', () => ({
        GetBudgetsQueryDto: undefined,
        BudgetStatus: undefined,
      }));

      await expect(import('./budget.service')).resolves.toHaveProperty(
        'BudgetService',
      );
    });
  });
});
