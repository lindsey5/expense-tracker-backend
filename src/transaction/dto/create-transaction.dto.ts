import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { TransactionCategory, TransactionType } from 'generated/prisma/enums';
import { TransactionResponseDto } from './transaction.dto';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  walletId!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ enum: TransactionCategory, example: TransactionCategory.FOOD })
  @IsEnum(TransactionCategory)
  category!: TransactionCategory;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({
    type: String,
    format: 'date',
    example: '2026-08-31',
  })
  @IsDateString()
  date!: string;
}


export class CreateTransactionResponse {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: TransactionResponseDto })
  transaction!: TransactionResponseDto;
}