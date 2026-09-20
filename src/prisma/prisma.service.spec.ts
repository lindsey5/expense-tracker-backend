import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import type { PrismaService as PrismaServiceInstance } from './prisma.service';

const prismaPgConstructor = jest.fn();

jest.unstable_mockModule('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation((args: unknown) => {
    prismaPgConstructor(args);
    return { adapter: 'pg' };
  }),
}));

describe('PrismaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a Prisma adapter from the configured database URL', async () => {
    const prismaModule = (await import('./prisma.service')) as unknown as {
      PrismaService: new (
        configService: ConfigService,
      ) => PrismaServiceInstance;
    };
    const get = jest
      .fn<(key: string) => string>()
      .mockReturnValue('postgresql://user:pass@localhost:5432/db');
    const configService = {
      get,
    } as unknown as ConfigService;

    const service = new prismaModule.PrismaService(configService);

    expect(service).toBeInstanceOf(prismaModule.PrismaService);
    expect(get).toHaveBeenCalledWith('DATABASE_URL');
    expect(prismaPgConstructor).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@localhost:5432/db',
    });
  });

  it('loads when reflected constructor types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('@nestjs/config', () => ({
        ConfigService: undefined,
      }));

      await expect(import('./prisma.service')).resolves.toHaveProperty(
        'PrismaService',
      );
    });
  });
});
