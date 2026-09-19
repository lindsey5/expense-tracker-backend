import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDTO, SignupUserDTO } from './dto/auth.dto';
import { comparePassword, hashPassword } from 'src/utils/auth';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signup(signupDTO: SignupUserDTO) {
    const isExisting = await this.prisma.user.findUnique({
      where: { email: signupDTO.email },
    });
    if (isExisting?.isVerified) {
      throw new ConflictException('Email is already registered');
    }

    const { verificationCode, verificationCodeExpiresAt } =
      this.emailService.generateVerificationCode();
    const hashedPassword = await hashPassword(signupDTO.password);

    const user = isExisting
      ? await this.prisma.user.update({
          where: { id: isExisting.id },
          data: {
            firstName: signupDTO.firstName,
            lastName: signupDTO.lastName,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt,
          },
        })
      : await this.prisma.user.create({
          data: {
            firstName: signupDTO.firstName,
            lastName: signupDTO.lastName,
            email: signupDTO.email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpiresAt,
          },
        });

    await this.emailService.sendVerificationCode(
      user.email,
      user.firstName,
      verificationCode,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      id: user.id,
    };
  }

  async resend(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found.');
    if (user.isVerified)
      throw new ConflictException('Email is already registered');

    const { verificationCode, verificationCodeExpiresAt } =
      this.emailService.generateVerificationCode();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiresAt },
    });

    await this.emailService.sendVerificationCode(
      user.email,
      user.firstName,
      verificationCode,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      id: user.id,
    };
  }

  async verifyUser(email: string, verificationCode: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundException('User not found.');
    if (user.isVerified) {
      throw new ConflictException('User account is already verified.');
    }
    if (!user.verificationCode) {
      throw new BadRequestException(
        'No verification code found. Please request a new code.',
      );
    }
    if (
      !user.verificationCodeExpiresAt ||
      new Date() > user.verificationCodeExpiresAt
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new code.',
      );
    }
    if (verificationCode !== user.verificationCode) {
      throw new BadRequestException('Invalid verification code.');
    }

    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return { message: 'Account successfully verified.', id: verifiedUser.id };
  }

  async login(loginDTO: LoginUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDTO.email, isVerified: true },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const isPasswordValid = await comparePassword(
      loginDTO.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    };
  }
}
