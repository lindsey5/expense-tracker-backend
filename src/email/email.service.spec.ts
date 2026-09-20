import { jest } from '@jest/globals';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailService as EmailServiceInstance } from './email.service';

type VerificationEmailPayload = {
  sender: {
    name: string;
    email: string;
  };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
};

const sendTransacEmail =
  jest.fn<(payload: VerificationEmailPayload) => Promise<void>>();
const getOrThrow = jest.fn<(key: string) => string>();

jest.unstable_mockModule('@getbrevo/brevo', () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: {
      sendTransacEmail,
    },
  })),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getOrThrow.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        BREVO_API_KEY: 'brevo-key',
        EMAIL_USER: 'noreply@example.com',
      };

      return values[key];
    });
  });

  const createService = async () => {
    const emailModule = (await import('./email.service')) as unknown as {
      EmailService: new (configService: ConfigService) => EmailServiceInstance;
    };

    return new emailModule.EmailService({
      getOrThrow,
    } as ConfigService);
  };

  it('sends a verification email through Brevo', async () => {
    const service = await createService();

    sendTransacEmail.mockResolvedValue(undefined);

    await expect(
      service.sendVerificationCode('test@example.com', 'John', '123456'),
    ).resolves.toBeUndefined();

    const [payload] = sendTransacEmail.mock.calls[0];

    expect(payload.sender).toEqual({
      name: 'Gastador',
      email: 'noreply@example.com',
    });
    expect(payload.to).toEqual([{ email: 'test@example.com' }]);
    expect(payload.subject).toBe('Gastador - Verification Code');
    expect(payload.htmlContent).toContain('123456');
  });

  it('throws when Brevo rejects the email request', async () => {
    const service = await createService();

    sendTransacEmail.mockRejectedValue(new Error('brevo unavailable'));

    await expect(
      service.sendVerificationCode('test@example.com', 'John', '123456'),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('generates a six digit code that expires in fifteen minutes', async () => {
    const service = await createService();
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.234567);
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-09-20T00:00:00.000Z').getTime());

    const result = service.generateVerificationCode();

    expect(result).toEqual({
      verificationCode: '311110',
      verificationCodeExpiresAt: new Date('2026-09-20T00:15:00.000Z'),
    });

    randomSpy.mockRestore();
    nowSpy.mockRestore();
  });

  it('loads when reflected constructor types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('@nestjs/config', () => ({
        ConfigService: undefined,
      }));

      await expect(import('./email.service')).resolves.toHaveProperty(
        'EmailService',
      );
    });
  });
});
