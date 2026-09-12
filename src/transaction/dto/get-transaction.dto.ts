import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';
import { TransactionCategory, TransactionType } from 'generated/prisma/enums';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';
import { TransactionResponseDto } from './transaction.dto';
import { Type } from 'class-transformer';

export class GetTransactionsDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;

    @ApiPropertyOptional({ enum: TransactionType })
    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @ApiPropertyOptional({ enum: TransactionCategory })
    @IsOptional()
    @IsEnum(TransactionCategory)
    category?: TransactionCategory;

    @ApiPropertyOptional({ example: 9 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month: number = new Date().getMonth() + 1;

    @ApiPropertyOptional({ example: 2026 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    year: number = new Date().getFullYear();

    @ApiPropertyOptional()
    @IsOptional()
    search?: string;
}

export class GetTransactionsResponseDto  {
    @ApiProperty({ type: [TransactionResponseDto] })
    transactions!: TransactionResponseDto[];

    @ApiProperty({ type: PaginationResponseDto })
    pagination!: PaginationResponseDto
}