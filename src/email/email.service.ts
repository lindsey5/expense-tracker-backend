import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient } from '@getbrevo/brevo';
import { verificationEmailTemplate } from 'src/templates/mail';

@Injectable()
export class EmailService {
  private readonly brevo: BrevoClient;

  constructor(private readonly configService: ConfigService) {
    this.brevo = new BrevoClient({
      apiKey: this.configService.getOrThrow<string>('BREVO_API_KEY'),
    });
  }

  async sendVerificationCode(
    email: string,
    firstName: string,
    verificationCode: string,
  ) {
    try {
      await this.brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: 'Gastador',
          email: this.configService.getOrThrow<string>('EMAIL_USER'),
        },

        to: [{ email }],

        subject: 'Gastador - Verification Code',

        htmlContent: verificationEmailTemplate(firstName, verificationCode),
      });

      console.log('Verification email sent successfully to', email);
    } catch (error) {
      console.error('Error sending verification email:', error);

      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  generateVerificationCode() {
    const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
    ).toString();

    const verificationCodeExpiresAt = new Date(
        Date.now() + 15 * 60 * 1000,
    );

    return {
        verificationCode,
        verificationCodeExpiresAt,
    };
  }
}
