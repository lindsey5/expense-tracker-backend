import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  signup: jest.fn(),
  verifyUser: jest.fn(),
  resend: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates signup requests to AuthService', async () => {
    const dto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Password@1',
    };
    const response = {
      message:
        'Registration successful. Please check your email to verify your account.',
      id: 'user-123',
    };

    mockAuthService.signup.mockResolvedValue(response);

    await expect(controller.signup(dto)).resolves.toEqual(response);
    expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
  });

  it('delegates verify requests to AuthService', async () => {
    const response = {
      message: 'Account successfully verified.',
      id: 'user-123',
    };

    mockAuthService.verifyUser.mockResolvedValue(response);

    await expect(
      controller.verifyUser({
        email: 'test@example.com',
        verificationCode: '123456',
      }),
    ).resolves.toEqual(response);
    expect(mockAuthService.verifyUser).toHaveBeenCalledWith(
      'test@example.com',
      '123456',
    );
  });

  it('delegates resend requests to AuthService', async () => {
    const response = {
      message:
        'Registration successful. Please check your email to verify your account.',
      id: 'user-123',
    };

    mockAuthService.resend.mockResolvedValue(response);

    await expect(
      controller.resend({ email: 'test@example.com' }),
    ).resolves.toEqual(response);
    expect(mockAuthService.resend).toHaveBeenCalledWith('test@example.com');
  });

  it('delegates login requests to AuthService', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    const response = {
      accessToken: 'access-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isVerified: true,
      },
    };

    mockAuthService.login.mockResolvedValue(response);

    await expect(controller.login(dto)).resolves.toEqual(response);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('loads when reflected decorator types fall back to Object', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.unstable_mockModule('./auth.service', () => ({
        AuthService: undefined,
      }));
      jest.unstable_mockModule('./dto/auth.dto', () => ({
        AuthResponseDto: undefined,
        LoginUserDTO: undefined,
        ResendDTO: undefined,
        ResendResponse: undefined,
        SignupResponse: undefined,
        SignupUserDTO: undefined,
        VerifyDTO: undefined,
        VerifyResponse: undefined,
      }));

      await expect(import('./auth.controller')).resolves.toHaveProperty(
        'AuthController',
      );
    });
  });
});
