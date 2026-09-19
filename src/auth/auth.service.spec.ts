import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { hashPassword } from 'src/utils/auth';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockEmailService = {
  generateVerificationCode: jest.fn(),
  sendVerificationCode: jest.fn(),
};

const mockGeneratedVerificationCode = {
  verificationCode: '123456',
  verificationCodeExpiresAt: new Date('2026-09-19T00:15:00.000Z'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEmailService.generateVerificationCode.mockReturnValue(
      mockGeneratedVerificationCode,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('logs in a verified user successfully', async () => {
      const hashedPassword = await hashPassword(loginDto.password);
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      await expect(service.login(loginDto)).resolves.toEqual({
        accessToken: 'access-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true,
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          isVerified: true,
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'test@example.com',
      });
    });

    it('throws when password is incorrect', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        password: await hashPassword('DifferentPassword123!'),
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password.',
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('throws when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid email or password.',
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password@1',
    };

    it('throws when email is already registered and verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'test@example.com',
        isVerified: true,
      });

      await expect(service.signup(signupDto)).rejects.toThrow(
        'Email is already registered',
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('updates an existing unverified user and sends a verification code', async () => {
      const existingUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Old',
        lastName: 'Name',
        isVerified: false,
      };
      const updatedUser = {
        ...existingUser,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      await expect(service.signup(signupDto)).resolves.toEqual({
        message:
          'Registration successful. Please check your email to verify your account.',
        id: 'user-123',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          password: expect.stringMatching(/^\$2[aby]\$12\$/),
          verificationCode: '123456',
          verificationCodeExpiresAt:
            mockGeneratedVerificationCode.verificationCodeExpiresAt,
        },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        '123456',
      );
    });

    it('creates a new user and sends a verification code', async () => {
      const createdUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      await expect(service.signup(signupDto)).resolves.toEqual({
        message:
          'Registration successful. Please check your email to verify your account.',
        id: 'user-123',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: expect.stringMatching(/^\$2[aby]\$12\$/),
          verificationCode: '123456',
          verificationCodeExpiresAt:
            mockGeneratedVerificationCode.verificationCodeExpiresAt,
        },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        '123456',
      );
    });
  });

  describe('resend', () => {
    it('throws when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resend('test@example.com')).rejects.toThrow(
        'User not found.',
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('throws when user is already verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        isVerified: true,
      });

      await expect(service.resend('test@example.com')).rejects.toThrow(
        'Email is already registered',
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('resends a verification code for an unverified user', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        isVerified: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.resend(user.email)).resolves.toEqual({
        message:
          'Registration successful. Please check your email to verify your account.',
        id: 'user-123',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: mockGeneratedVerificationCode,
      });
      expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        'John',
        '123456',
      );
    });
  });

  describe('verifyUser', () => {
    it('throws when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyUser('test@example.com', '123456'),
      ).rejects.toThrow('User not found.');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws when user is already verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        isVerified: true,
      });

      await expect(
        service.verifyUser('test@example.com', '123456'),
      ).rejects.toThrow('User account is already verified');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws when user has no verification code', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        isVerified: false,
      });

      await expect(
        service.verifyUser('test@example.com', '123456'),
      ).rejects.toThrow('No verification code found');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws when verification code is expired', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        verificationCode: '123456',
        verificationCodeExpiresAt: new Date(Date.now() - 15 * 60 * 1000),
        isVerified: false,
      });

      await expect(
        service.verifyUser('test@example.com', '123456'),
      ).rejects.toThrow('Verification code has expired');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws when verification code is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        verificationCode: '123456',
        verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        isVerified: false,
      });

      await expect(
        service.verifyUser('test@example.com', '654321'),
      ).rejects.toThrow('Invalid verification code.');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('verifies a user successfully', async () => {
      const user = {
        id: 'user-123',
        verificationCode: '123456',
        verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        isVerified: false,
      };
      const verifiedUser = {
        ...user,
        isVerified: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue(verifiedUser);

      await expect(
        service.verifyUser('test@example.com', '123456'),
      ).resolves.toEqual({
        message: 'Account successfully verified.',
        id: 'user-123',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          isVerified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });
    });
  });
});
