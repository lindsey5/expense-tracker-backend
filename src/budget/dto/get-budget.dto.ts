import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    Max,
    Min,
} from 'class-validator';

export enum BudgetStatus {
    'ON_TRACK', 'WARNING', 'EXCEEDED'
}

export class GetBudgetQueryDto {
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

    @ApiPropertyOptional({
        enum: BudgetStatus,
        example: BudgetStatus.WARNING,
    })
    @IsEnum(BudgetStatus)
    status?: BudgetStatus;
}