import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, jwtFromBearerToken } from './jwt.strategy';

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

  it('extracts a bearer token from the authorization header', () => {
    expect(
      jwtFromBearerToken({ headers: { authorization: 'Bearer token-123' } }),
    ).toBe('token-123');
  });

  it('returns null for missing or malformed authorization headers', () => {
    expect(jwtFromBearerToken(undefined)).toBeNull();
    expect(jwtFromBearerToken({ headers: {} })).toBeNull();
    expect(
      jwtFromBearerToken({ headers: { authorization: 'Basic abc' } }),
    ).toBeNull();
    expect(
      jwtFromBearerToken({ headers: { authorization: 'Bearer' } }),
    ).toBeNull();
  });

  it('rejects the token when the user no longer exists', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'missing-user', email: 'test@example.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
