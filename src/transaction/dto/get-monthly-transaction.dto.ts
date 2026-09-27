import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetMonthlyTransactionsQueryDto {
  @ApiPropertyOptional({
    example: new Date().getFullYear(),
    default: new Date().getFullYear(),
    minimum: 2000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number = new Date().getFullYear();
}

export class GetMonthlyTransactionsResponseDto {
  @ApiProperty()
  month!: number;

  @ApiProperty()
  income!: number;

  @ApiProperty()
  expense!: number;
}
