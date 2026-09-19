import { ApiProperty } from '@nestjs/swagger';
import { TransactionCategory } from 'generated/prisma/enums';
import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    enum: TransactionCategory,
    example: TransactionCategory.FOOD,
  })
  @IsEnum(TransactionCategory)
  category!: TransactionCategory;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    example: 9,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({
    example: 2026,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  year!: number;
}
