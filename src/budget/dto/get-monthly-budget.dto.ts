import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class GetMonthlyBudgetQueryDto {
  @ApiPropertyOptional({
    example: new Date().getMonth() + 1,
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiPropertyOptional({
    example: new Date().getFullYear(),
    minimum: 2000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;
}

export class GetMonthlyBudgetResponse {
  @ApiProperty({
    example: new Date().getMonth() + 1,
  })
  month!: number;

  @ApiProperty({
    example: new Date().getFullYear(),
  })
  year!: number;

  @ApiProperty()
  totalBudget!: number;

  @ApiProperty()
  spending!: number;

  @ApiProperty()
  remaining!: number;

  @ApiProperty()
  percentage!: number;
}
