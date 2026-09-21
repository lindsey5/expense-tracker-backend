import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaService } from 'src/prisma/prisma.service';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  const mockPrismaService = {
    wallet: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('throws when a wallet with the same name already exists', async () => {
    mockPrismaService.wallet.findFirst.mockResolvedValue({ id: 'wallet-1' });

    await expect(
      service.create('user-123', {
        name: 'Cash',
        type: 'E_WALLET' as any,
        balance: 100,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('creates a wallet when the name is unique', async () => {
    const createdWallet = {
      id: 'wallet-1',
      userId: 'user-123',
      name: 'Cash',
      type: 'E_WALLET',
      balance: 100,
    };

    mockPrismaService.wallet.findFirst.mockResolvedValue(null);
    mockPrismaService.wallet.create.mockResolvedValue(createdWallet);

    await expect(
      service.create('user-123', {
        name: 'Cash',
        type: 'E_WALLET' as any,
        balance: 100,
      }),
    ).resolves.toEqual({
      wallet: createdWallet,
      message: 'Wallet successfully added',
    });
  });

  it('returns all wallets for a user', async () => {
    const wallets = [{ id: 'wallet-1', userId: 'user-123' }];
    mockPrismaService.wallet.findMany.mockResolvedValue(wallets);

    await expect(service.findAll('user-123')).resolves.toEqual({ wallets });
  });

  it('returns total wallet count and balance', async () => {
    mockPrismaService.wallet.count.mockResolvedValue(2);
    mockPrismaService.wallet.aggregate.mockResolvedValue({
      _sum: { balance: 2500 },
    });

    await expect(service.getTotalBalance('user-123')).resolves.toEqual({
      totalWallets: 2,
      totalBalance: 2500,
    });
  });

  it('rejects wallet update when the wallet does not exist', async () => {
    mockPrismaService.wallet.findUnique.mockResolvedValue(null);

    await expect(service.update('wallet-1', { balance: 250 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updates a wallet when it exists', async () => {
    const updatedWallet = {
      id: 'wallet-1',
      userId: 'user-123',
      name: 'Cash',
      type: 'E_WALLET',
      balance: 250,
    };

    mockPrismaService.wallet.findUnique.mockResolvedValue({ id: 'wallet-1' });
    mockPrismaService.wallet.update.mockResolvedValue(updatedWallet);

    await expect(service.update('wallet-1', { balance: 250 })).resolves.toEqual(
      {
        wallet: updatedWallet,
        message: 'Wallet updated successfully',
      },
    );
  });

  it('returns a placeholder removal message', () => {
    expect(service.remove(1)).toBe('This action removes a #1 wallet');
  });
});
