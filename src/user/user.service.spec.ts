import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('returns a user-not-found message when the email is not registered', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.userLookup('missing@example.com')).resolves.toEqual({
      message: 'User not found.',
    });
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'missing@example.com' },
    });
  });

  it('returns an already-registered message when the email exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-123' });

    await expect(service.userLookup('existing@example.com')).resolves.toEqual({
      message: 'This email is already registered.',
    });
  });
});
