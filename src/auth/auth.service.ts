import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface GoogleUser {
  googleId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(googleUser: GoogleUser) {
    console.log(googleUser)
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
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }
}