import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TransactionCategory, TransactionType } from 'generated/prisma/enums';

import { WalletDto } from 'src/wallet/dto/wallet.dto';

export class TransactionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  walletId!: string;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty({ enum: TransactionCategory })
  category!: TransactionCategory;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: WalletDto, nullable: true })
  wallet?: WalletDto | null;
}