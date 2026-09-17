import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { TransactionModule } from './transaction/transaction.module';
import { WalletModule } from './wallet/wallet.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    TransactionModule,
    WalletModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, JwtStrategy],
})
export class AppModule {}
