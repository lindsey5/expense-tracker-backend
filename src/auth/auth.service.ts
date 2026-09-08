import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleUserDto } from './dto/google-login.dto';
import { LoginUserDTO, SignupUserDTO } from './dto/auth.dto';
import { createHash, randomBytes } from 'crypto';
import { comparePassword, hashPassword } from 'src/utils/auth';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async googleLogin(googleUser: GoogleUserDto) {
    if (!googleUser.email) {
      throw new Error('Google account does not have an email');
    }

    let user = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });


    // Create user if they don't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName ?? '',
          lastName: googleUser.lastName ?? '',
          avatar: googleUser.avatar,
          isVerified: true
        },
      });
    } else { 
      // Existing account is not linked to Google 
      if (!user.googleId) { 
        throw new UnauthorizedException('This email is already registered with a password. Please log in using your email and password.'); 
      } 
      // Optional: make sure the Google account matches 
      if (user.googleId !== googleUser.googleId) { 
        throw new UnauthorizedException( 'This Google account is not linked to this user.', ); 
      } 
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };
  }

  async signup(signupDTO: SignupUserDTO) {
    const isExisting = await this.prisma.user.findUnique({
      where: {
        email: signupDTO.email,
      },
    });

    // Don't allow an already verified account to register again
    if (isExisting?.isVerified) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Code expires in 15 minutes
    const verificationCodeExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    const hashedPassword = await hashPassword(
      signupDTO.password,
    );

    const user = isExisting
      ? await this.prisma.user.update({
          where: {
            id: isExisting.id,
          },
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

    // Send verification code
    await this.emailService.sendVerificationCode(
      user.email,
      user.firstName,
      verificationCode,
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      id: user.id,
    };
  }

  async verifyUser(id: string, verificationCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isVerified) {
      throw new ConflictException('User account is already verified.');
    }

    if (!user.verificationCode) {
      throw new BadRequestException('No verification code found. Please request a new code.');
    }

    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    if (verificationCode !== user.verificationCode) {
      throw new BadRequestException('Invalid verification code.');
    }

    const verifiedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'Account successfully verified .',
      id: verifiedUser.id,
    };
  }

  async login(loginDTO: LoginUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDTO.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.',);
    }

    if (!user.password) {
      throw new UnauthorizedException('This account uses Google login.',);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.',);
    }

    const isPasswordValid = await comparePassword(loginDTO.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };
  }
}