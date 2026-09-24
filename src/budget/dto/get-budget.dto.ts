import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { TransactionCategory } from 'generated/prisma/enums';

export enum BudgetStatus {
  ON_TRACK = 'ON_TRACK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
}

export class GetBudgetsQueryDto {
  @Type(() => Number)
  @ApiProperty({
    example: new Date().getMonth() + 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @Type(() => Number)
  @ApiProperty({
    example: new Date().getFullYear(),
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiPropertyOptional({
    enum: BudgetStatus,
    example: BudgetStatus.WARNING,
  })
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;
}

export class GetBudgetDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  spent!: number;

  @ApiProperty()
  remaining!: number;

  @ApiProperty()
  percentage!: number;

  @ApiProperty({
    enum: BudgetStatus,
    example: BudgetStatus.ON_TRACK,
  })
  status!: BudgetStatus;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  year!: number;

  @ApiProperty({
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class GetBudgetsResponse {
  @ApiProperty({
    type: () => GetBudgetDto,
    isArray: true,
  })
  budgets!: GetBudgetDto[];
}
