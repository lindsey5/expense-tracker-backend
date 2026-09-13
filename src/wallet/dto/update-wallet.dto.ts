import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { WalletResponseWrapperDto } from './wallet.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WalletType } from 'generated/prisma/enums';

export class UpdateWalletDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;

    @ApiPropertyOptional({
        enum: WalletType,
        example: WalletType.E_WALLET,
    })
    @IsOptional()
    @IsEnum(WalletType)
    type?: WalletType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    balance?: number;
}

export class UpdateWalletResponseDto extends WalletResponseWrapperDto {}