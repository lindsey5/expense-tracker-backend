import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

const mockConfigService = {
  getOrThrow: jest.fn(() => 'jwt-secret'),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();

    strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService,
      mockPrismaService as never,
    );
  });

  it('returns the payload when the token user exists', async () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };

    mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-123' });

    await expect(strategy.validate(payload)).resolves.toEqual(payload);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      select: { id: true },
    });
  });

  it('rejects the token when the user no longer exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'missing-user', email: 'test@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
