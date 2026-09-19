import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { hashPassword } from 'src/utils/auth';
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

const mockPrismaService = {
  user: {
    findUnique: jest.fn<(args?: any) => Promise<any>>(),
    create: jest.fn<(args?: any) => Promise<any>>(),
    update: jest.fn<(args?: any) => Promise<any>>(),
  },
};

const mockJwtService = {
  signAsync: jest.fn<(payload?: any) => Promise<string>>(),
};

const mockEmailService = {
    generateVerificationCode: jest.fn<(args?: any) => { verificationCode: string, verificationCodeExpiresAt: Date }>(),
    sendVerificationCode: jest.fn<(email?: string, firstName?: string, code?: string) => Promise<void>>(),
};

const mockGeneratedVerificationCode = { 
    verificationCode: "123456", 
    verificationCodeExpiresAt: new Date()
}

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        jest.clearAllMocks();

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

        it('should login successfully', async () => {
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

            const result = await service.login(loginDto);

            expect(result).toEqual({
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

        it('should throw error when password is incorrect', async () => {
            const user = {
                id: 'user-123',
                email: 'test@example.com',
                password: 'some-hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                isVerified: true,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password.');
        });

        it('should throw error when user is not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password.');
            
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });
    });

    describe('signup', () => {
        const signupDto = {
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            password: "Password@1",
        }

        it('should return error when email is already registered', async () => {
            const user = {
                email: "test@example.com",
                isVerified: true
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            await expect(service.signup(signupDto)).rejects.toThrow('Email is already registered');
            
            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
            expect(mockPrismaService.user.create).not.toHaveBeenCalled();
            expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled();
        })

        it('should signup successfully', async () => {
            const user = { 
                id: "user-123", 
                email: "test@example.com", 
                firstName: "John",
                lastName: "Doe",
                password: "Password@1",
                isVerified: false,
            };
            
            mockPrismaService.user.findUnique.mockResolvedValue(user);
            mockPrismaService.user.update.mockResolvedValue(user);
            mockEmailService.generateVerificationCode.mockReturnValue(mockGeneratedVerificationCode);

            expect(await service.signup(signupDto)).toEqual({
                message: 'Registration successful. Please check your email to verify your account.',
                id: user.id
            });

            expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
                'test@example.com',
                'John',
                mockGeneratedVerificationCode.verificationCode
            );

            expect(mockPrismaService.user.create).not.toHaveBeenCalled();
        })

        it('should signup successfully', async () => {
            const user = { 
                id: "user-123", 
                email: "test@example.com", 
                firstName: "test",
                password: "Password123@",
                isVerified: false,
            };
            
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue(user);

            expect(await service.signup(signupDto)).toEqual({
                message: 'Registration successful. Please check your email to verify your account.',
                id: user.id,
            });

            expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
                'test@example.com',
                'test',
                expect.stringMatching(/^\d{6}$/),
            );

            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
        })
    })

    describe('resend', () => {
        it('should throw error when user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.resend('test@example.com')).rejects.toThrow('User not found.');
        
            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
            expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled();
        });

        it('should throw error when user is already verified', async () => {
            const user = {
                isVerified: true,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            await expect(service.resend('test@example.com')).rejects.toThrow('Email is already registered');

            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
            expect(mockEmailService.sendVerificationCode).not.toHaveBeenCalled()
        })

        it('should resend successfully', async () => {
            const user = { 
                id: "user-123", 
                email: "test@example.com", 
                firstName: "test",
                password: "Password123@",
                isVerified: false,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(user);
            mockEmailService.generateVerificationCode.mockReturnValue(mockGeneratedVerificationCode);

            expect(await service.resend(user.email)).toEqual({
                message:  'Registration successful. Please check your email to verify your account.',
                id: user.id
            })

            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: user.id },
                data: mockGeneratedVerificationCode,
            })

            expect(mockEmailService.sendVerificationCode).toHaveBeenCalledWith(
                user.email,
                user.firstName,
                mockGeneratedVerificationCode.verificationCode,
            );

        })
    })

    describe('verify', () => {
        
        it('should throw error when user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            expect(service.verifyUser("test@example.com", "123456")).rejects.toThrow('User not found.');;

            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
        })

        it('should throw error when user is already verified', async () => {
            const user = {
                isVerified: true,
            }
            
            mockPrismaService.user.findUnique.mockResolvedValue(user);

            expect(service.verifyUser("test@example.com", "123456")).rejects.toThrow('User account is already verified');
        })

        it('should throw error when user do not have verification code', async () => {
            const user = {
                isVerified: false,
            } 

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            expect(service.verifyUser("test@example.com", "123456")).rejects.toThrow("No verification code found. Please request a new code.")

            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
        })

        it('should throw error when verification code is expired', () => {
            const user = {
                verificationCode: "123456",
                verificationCodeExpiresAt: new Date(Date.now() - 15 * 60 * 1000),
                isVerified: false,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            expect(service.verifyUser("test@example.com", "123456")).rejects.toThrow('Verification code has expired. Please request a new code.');
            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
        })

        it('should throw error when verification code is incorrect', () => {
            const user = {
                verificationCode: "123456",
                verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
                isVerified: false,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user);

            expect(service.verifyUser("text@example.com", "123458")).rejects.toThrow("Invalid verification code.");
            expect(mockPrismaService.user.update).not.toHaveBeenCalled();
        })

        it('should verify successfully', async () => {
            const user = {
                id: "user-123",
                verificationCode: "123456",
                verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
                isVerified: false,
            }

            mockPrismaService.user.findUnique.mockResolvedValue(user);
            mockPrismaService.user.update.mockResolvedValue(user);

            expect(await service.verifyUser("text@example.com", "123456")).toEqual({
               message: 'Account successfully verified.', 
               id: user.id
            })

            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationCode: null,
                    verificationCodeExpiresAt: null
                }
            })
        })
    })
});