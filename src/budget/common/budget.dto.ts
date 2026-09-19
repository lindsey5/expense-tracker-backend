import { ApiProperty } from '@nestjs/swagger';
import { TransactionCategory } from 'generated/prisma/enums';

export class BudgetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({
    enum: TransactionCategory,
    example: TransactionCategory.FOOD,
  })
  category!: TransactionCategory;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
